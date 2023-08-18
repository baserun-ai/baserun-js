export function isValidJson(output: string): boolean {
  try {
    JSON.parse(output);
    return true;
  } catch {
    return false;
  }
}
