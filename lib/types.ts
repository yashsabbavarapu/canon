export type Piece = {
  id: string;
  slug: string;
  title: string;
  published_at: string;
  source: "hashnode" | "original";
  url?: string;
  body_markdown: string;
  topics: string[];
  summary: string;
  sample: boolean;
};

export type LogEntry = {
  at: string;
  action: string;
  detail: string;
};
