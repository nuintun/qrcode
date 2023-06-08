/**
 * @module segment
 */

export function assertContent(content: string): void {
  if (!content) {
    throw new Error('segment content should be at least 1 character');
  }
}
