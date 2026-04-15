export type PageId =
  | 'overview'
  | 'tokenization'
  | 'embedding'
  | 'attention'
  | 'feed-forward'
  | 'sampling';

export interface PageDef {
  id: PageId;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  order: number;
}
