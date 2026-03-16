/**
 * Returns true if the server ref is a numeric ID, false if it's a name.
 *
 * @public
 */
export function isServerId(ref: string): boolean {
  return /^\d+$/.test(ref);
}
