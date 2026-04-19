param(
    [string]$Model
)

$API_BASE = "https://llm-explorer.romaine.life/llm"
$PROFILE_DIR = "D:\profiles\shell-config-profile-1"

# --- JWT minting (same secret as fzt-terminal) ---

function Get-JWTSecret {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public class CredRead {
    [DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
    static extern bool CredReadW(string target, int type, int flags, out IntPtr cred);
    [DllImport("advapi32.dll")]
    static extern void CredFree(IntPtr buffer);
    [StructLayout(LayoutKind.Sequential)]
    struct CREDENTIAL {
        public int Flags; public int Type; public IntPtr TargetName; public IntPtr Comment;
        public long LastWritten; public int CredentialBlobSize; public IntPtr CredentialBlob;
        public int Persist; public int AttributeCount; public IntPtr Attributes;
        public IntPtr TargetAlias; public IntPtr UserName;
    }
    public static string Read(string target) {
        IntPtr ptr;
        if (!CredReadW(target, 1, 0, out ptr)) return null;
        var cred = Marshal.PtrToStructure<CREDENTIAL>(ptr);
        var bytes = new byte[cred.CredentialBlobSize];
        Marshal.Copy(cred.CredentialBlob, bytes, 0, bytes.Length);
        CredFree(ptr);
        return Encoding.UTF8.GetString(bytes);
    }
}
'@ -ErrorAction SilentlyContinue
    return [CredRead]::Read("homepage:jwt-secret")
}

function B64URL($bytes) {
    [Convert]::ToBase64String($bytes).Replace('+','-').Replace('/','_').TrimEnd('=')
}

function Mint-JWT {
    $secret = Get-JWTSecret
    if (-not $secret) { Write-Host "JWT secret not found in credential store" -ForegroundColor Red; return $null }

    $identity = Get-Content "$PROFILE_DIR\at-menu\.identity" -Raw -ErrorAction SilentlyContinue
    if (-not $identity) { $identity = "nelson" }
    $identity = $identity.Trim()

    $identities = Get-Content "$PROFILE_DIR\at-menu\identities.json" -Raw | ConvertFrom-Json
    $id = $identities.$identity

    $header = B64URL([Text.Encoding]::UTF8.GetBytes('{"alg":"HS256","typ":"JWT"}'))
    $now = [int][DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $exp = $now + 300
    $payloadJson = "{`"sub`":`"$($id.sub)`",`"email`":`"$($id.email)`",`"name`":`"$($id.name)`",`"role`":`"$($id.role)`",`"iat`":$now,`"exp`":$exp}"
    $payload = B64URL([Text.Encoding]::UTF8.GetBytes($payloadJson))
    $msg = "$header.$payload"
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = [Text.Encoding]::UTF8.GetBytes($secret)
    $sig = B64URL($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($msg)))
    return "$msg.$sig"
}

function API-Call($method, $path, $body) {
    $token = Mint-JWT
    if (-not $token) { return $null }
    $headers = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }
    $uri = "$API_BASE$path"
    try {
        if ($body) {
            $json = $body | ConvertTo-Json -Depth 10
            Invoke-RestMethod -Uri $uri -Method $method -Headers $headers -Body $json
        } else {
            Invoke-RestMethod -Uri $uri -Method $method -Headers $headers
        }
    } catch {
        Write-Host "API error: $_" -ForegroundColor DarkYellow
        $null
    }
}

# --- Model selection ---

if (-not $Model) {
    $models = ollama list 2>$null | Select-Object -Skip 1 | ForEach-Object { ($_ -split '\s+')[0] }
    if (-not $models) { Write-Host "No models installed. Run: ollama pull llama3.1:8b"; return }
    $Model = $models | fzf --height 40% --layout reverse --border --prompt="Model: "
    if (-not $Model) { return }
}

# --- Session setup ---

$sessionId = (Get-Date -Format 'yyyyMMdd-HHmmss') + "-" + ($Model -replace '[:/]', '-')

# Create session in cloud
$createResp = API-Call "Post" "/api/sessions" @{ sessionId = $sessionId; model = $Model }
if ($createResp) {
    Write-Host "Session: $sessionId" -ForegroundColor DarkGray
    Write-Host "Cloud logging active" -ForegroundColor DarkGray
} else {
    Write-Host "Session: $sessionId (local only)" -ForegroundColor DarkYellow
}

Write-Host "Chatting with $Model" -ForegroundColor Cyan
Write-Host "Type /bye to exit`n" -ForegroundColor DarkGray

$messages = @()

while ($true) {
    Write-Host "you> " -NoNewline -ForegroundColor Green
    $userInput = Read-Host
    if ($userInput -eq '/bye' -or $userInput -eq '') { break }

    $messages += @{ role = 'user'; content = $userInput }

    $body = @{
        model = $Model
        messages = $messages
        stream = $false
    } | ConvertTo-Json -Depth 10

    try {
        $resp = Invoke-RestMethod -Uri 'http://localhost:11434/api/chat' -Method Post -Body $body -ContentType 'application/json'
        $reply = $resp.message.content
        $messages += @{ role = 'assistant'; content = $reply }

        Write-Host "`n$reply`n" -ForegroundColor White

        # Push exchange to cloud
        $exchange = @{
            message = @{
                user = $userInput
                assistant = $reply
                timestamp = (Get-Date).ToString('o')
                eval_duration_ms = if ($resp.eval_duration) { [math]::Round($resp.eval_duration / 1e6) } else { $null }
                total_duration_ms = if ($resp.total_duration) { [math]::Round($resp.total_duration / 1e6) } else { $null }
            }
        }
        API-Call "Put" "/api/sessions/$sessionId" $exchange | Out-Null
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

# Mark session ended
API-Call "Patch" "/api/sessions/$sessionId/end" $null | Out-Null
Write-Host "`nSession ended: $sessionId" -ForegroundColor DarkGray
