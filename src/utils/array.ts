export function toArray<T>(target: T | T[]): T[] {
  return Array.isArray(target) ? target : [target]
}
