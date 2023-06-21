const templateRegex = new RegExp('\\$\\{\\s*(\\w+)\\s*}', 'g');

export function templatizeString(
  template: string,
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  variables: any = {},
): string {
  return template.replace(
    templateRegex,
    (_substring: string, variable: string) => {
      if (variable in variables) {
        return variables[variable];
      }

      throw new Error(`Variable '${variable}' not found`);
    },
  );
}
