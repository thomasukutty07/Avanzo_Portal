/** Normalize DRF paginated `{ results }` or plain arrays. */
export function extractResults<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray((data as { results: unknown }).results)
  ) {
    return (data as { results: T[] }).results
  }
  return []
}
