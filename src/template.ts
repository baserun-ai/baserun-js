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
  variables: Record<string, string> = {},
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp('\\{\\{\\s*' + key + '\\s*\\}\\}', 'g');
    if (!regex.test(result)) {
      throw new Error(`Variable '${key}' not found`);
    }

    result = result.replace(regex, value);
  }

  return result;
}

interface LiteralSegment {
  type: 'literal';
  text: string;
}

interface VariableSegment {
  type: 'variable';
  name: string;
}

export type Segment = LiteralSegment | VariableSegment;

export function parseVariablesFromTemplateString(template: string): Segment[] {
  const segments: Segment[] = [];
  let currentIndex = 0;
  const regex = new RegExp('\\{\\{([^{}]*?)}}', 'g');
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (match.index > currentIndex) {
      segments.push({
        type: 'literal',
        text: template.slice(currentIndex, match.index),
      });
    }

    segments.push({
      type: 'variable',
      name: match[1].trim(),
    });

    currentIndex = regex.lastIndex;
  }

  if (currentIndex < template.length) {
    segments.push({
      type: 'literal',
      text: template.slice(currentIndex),
    });
  }

  return segments;
}
