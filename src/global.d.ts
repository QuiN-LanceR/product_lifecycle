// global.d.ts
declare const grecaptcha: {
  execute(siteKey: string, options: { action: string }): Promise<string>;
};
