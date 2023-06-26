export function pickKeys(
  keys: string[] = [],
  variables: Record<string, string> = {},
): Record<string, string> {
  return keys.reduce((acc: Record<string, string>, key: string) => {
    if (!(key in variables)) {
      throw new Error(`Variable '${key}' was not provided`);
    }

    acc[key] = variables[key];
    return acc;
  }, {});
}

export function templatizeString(
  template: string,
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  variables: { [key: string]: string } = {},
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp('\\{\\s*' + key + '\\s*}', 'g');
    if (!regex.test(result)) {
      throw new Error(`Variable '${key}' not found`);
    }

    result = result.replace(regex, value);
  }

  return result;
}
