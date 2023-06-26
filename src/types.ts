export enum BaserunProvider {
  OpenAI = 'openai',
}

export enum BaserunType {
  Chat = 'chat',
  Completion = 'completion',
}

export interface Variables {
  variables?: string[];
}
