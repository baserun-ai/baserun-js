export function getTimestamp(): number {
  return Date.now() / 1000;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}
