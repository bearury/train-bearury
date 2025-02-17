export function removeNullFromArray<T>(arr: (T | null)[]): T[] {
  return arr.filter(item => item !== null);
}
