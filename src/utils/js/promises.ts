export type Unpromise<T> = T extends Promise<infer U> ? U : T;

export async function unpromise<T>(valueOrPromise: T | Promise<T>): Promise<T> {
  if (valueOrPromise instanceof Promise) {
    return await valueOrPromise;
  }
  return valueOrPromise;
}
