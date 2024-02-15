class KeyError extends Error {
  constructor(key: any) {
    super(`KeyError: ${key}`);
  }
}

export class FormattedString {
  // really basic attempt of replicating python str.format(). unfortunately, behavior varies by quite a lot right now.
  // the correct way would be to make a proper parser that consumes token by token and then add formatting features
  private readonly str: string;
  private slots: Set<string>;

  private getSlots(str: string): Set<string> {
    const set = new Set<string>();
    for (const match of str.matchAll(/{([A-Za-z_]\w*)}/g)) {
      set.add(match[1]);
    }
    return set;
  }
  constructor(str: string) {
    this.str = str;
    this.slots = this.getSlots(str);
  }

  format(parameters: Record<string, any>): string {
    let out = this.str;
    this.slots.forEach((v) => {
      if (!Object.prototype.hasOwnProperty.call(parameters, v)) {
        throw new KeyError(v);
      }
      out = out.replaceAll(`{${v}}`, parameters[v]);
    });
    Object.keys(parameters);
    return out;
  }
}
