const { default: OpenAI } = await import('openai');

export function patch() {
  const oldCreate = OpenAI.Completions.prototype.create;
  OpenAI.Completions.prototype.create = function (this: any) {
    console.log('yes we are patching completions');
    // eslint-disable-next-line prefer-rest-params
    return oldCreate.apply(this, arguments as any);
  } as any;

  const oldChatCreate = OpenAI.Chat.Completions.prototype.create;
  OpenAI.Chat.Completions.prototype.create = function (this: any) {
    console.log('yes we are patching chat');
    // eslint-disable-next-line prefer-rest-params
    return oldChatCreate.apply(this, arguments as any);
  } as any;
}
