export function isValidJson(output: string | object): boolean {
  if (typeof output === 'object') {
    return true;
  }
  try {
    JSON.parse(output);
    return true;
  } catch {
    return false;
  }
}
