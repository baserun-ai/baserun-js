export enum BaserunProvider {
  OpenAI = 'openai',
  Google = 'google',
}

export enum BaserunType {
  Chat = 'chat',
  Completion = 'completion',
}

export interface Variables {
  variables?: string[];
}
