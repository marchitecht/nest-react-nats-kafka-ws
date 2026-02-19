export interface Message {
  id: string;
  ts: string;
  body: any;
}

export interface StateDTO {
  live: Message[];
  history: Message[];
}
