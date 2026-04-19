import { Router } from 'express';

/**
 * LLM session logging routes.
 * Sessions are Cosmos DB documents in the shared userdata container.
 * Each session is a single document that gets updated as messages accumulate.
 *
 * Document shape:
 *   id:        "llm_{userId}_{sessionId}"
 *   userId:    partition key
 *   type:      "llm-session"
 *   sessionId: timestamp-based ID from client
 *   model:     model name (e.g. "llama3.1:8b")
 *   started:   ISO timestamp
 *   ended:     ISO timestamp (null while active)
 *   messages:  [{ user, assistant, timestamp, eval_duration_ms, total_duration_ms }]
 *
 * @param {{
 *   requireAuth: Function,
 *   container: import('@azure/cosmos').Container,
 * }} opts
 */
export function createLLMRoutes({ requireAuth, container }) {
  const router = Router();

  function docId(userId, sessionId) {
    return `llm_${userId}_${sessionId}`;
  }

  // POST /api/sessions — create a new session
  router.post('/api/sessions', requireAuth, async (req, res) => {
    try {
      const userId = req.user.sub;
      const { sessionId, model } = req.body;

      if (!sessionId || !model) {
        return res.status(400).json({ error: 'sessionId and model are required' });
      }

      const now = new Date().toISOString();
      const doc = {
        id: docId(userId, sessionId),
        userId,
        type: 'llm-session',
        sessionId,
        model,
        started: now,
        ended: null,
        messages: [],
      };

      await container.items.create(doc);
      res.json({ sessionId, started: now });
    } catch (error) {
      if (error.code === 409) {
        return res.status(409).json({ error: 'Session already exists' });
      }
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session', message: error.message });
    }
  });

  // PUT /api/sessions/:sessionId — append a message exchange
  router.put('/api/sessions/:sessionId', requireAuth, async (req, res) => {
    try {
      const userId = req.user.sub;
      const { sessionId } = req.params;
      const { message } = req.body;

      if (!message || !message.user || !message.assistant) {
        return res.status(400).json({ error: 'message with user and assistant fields required' });
      }

      const id = docId(userId, sessionId);
      const { resource } = await container.item(id, userId).read();

      if (!resource) {
        return res.status(404).json({ error: 'Session not found' });
      }

      resource.messages.push(message);
      await container.item(id, userId).replace(resource);

      res.json({ sessionId, messageCount: resource.messages.length });
    } catch (error) {
      if (error.code === 404) {
        return res.status(404).json({ error: 'Session not found' });
      }
      console.error('Error appending message:', error);
      res.status(500).json({ error: 'Failed to append message', message: error.message });
    }
  });

  // PATCH /api/sessions/:sessionId/end — mark session as ended
  router.patch('/api/sessions/:sessionId/end', requireAuth, async (req, res) => {
    try {
      const userId = req.user.sub;
      const { sessionId } = req.params;
      const id = docId(userId, sessionId);

      const { resource } = await container.item(id, userId).read();
      if (!resource) {
        return res.status(404).json({ error: 'Session not found' });
      }

      resource.ended = new Date().toISOString();
      await container.item(id, userId).replace(resource);

      res.json({ sessionId, ended: resource.ended, messageCount: resource.messages.length });
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({ error: 'Failed to end session', message: error.message });
    }
  });

  // GET /api/sessions/:sessionId — read a specific session
  router.get('/api/sessions/:sessionId', requireAuth, async (req, res) => {
    try {
      const userId = req.user.sub;
      const { sessionId } = req.params;
      const id = docId(userId, sessionId);

      const { resource } = await container.item(id, userId).read();
      if (!resource) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({
        sessionId: resource.sessionId,
        model: resource.model,
        started: resource.started,
        ended: resource.ended,
        messages: resource.messages,
      });
    } catch (error) {
      if (error.code === 404) {
        return res.status(404).json({ error: 'Session not found' });
      }
      console.error('Error fetching session:', error);
      res.status(500).json({ error: 'Failed to fetch session', message: error.message });
    }
  });

  // GET /api/sessions — list recent sessions
  router.get('/api/sessions', requireAuth, async (req, res) => {
    try {
      const userId = req.user.sub;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);

      const { resources } = await container.items.query({
        query: `SELECT c.sessionId, c.model, c.started, c.ended,
                       ARRAY_LENGTH(c.messages) AS messageCount
                FROM c
                WHERE c.type = 'llm-session' AND c.userId = @userId
                ORDER BY c.started DESC
                OFFSET 0 LIMIT @limit`,
        parameters: [
          { name: '@userId', value: userId },
          { name: '@limit', value: limit },
        ],
      }).fetchAll();

      res.json({ sessions: resources });
    } catch (error) {
      console.error('Error listing sessions:', error);
      res.status(500).json({ error: 'Failed to list sessions', message: error.message });
    }
  });

  return router;
}
