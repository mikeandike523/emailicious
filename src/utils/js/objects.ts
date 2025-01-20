/**
 *
 * Helps when omission of a property is more useful than having it explicitly undefined.
 * Works best to make sure that optional fields with undefined values become omitted instead of explicitly undefined.
 *
 * @param obj -
 * An object with optional properties where the input data may have explict undefined values.
 * @param enumerableOnly -
 * If true, use Object.keys. If false use Object.getOwnPropertyNames.
 * Defaults to true, which is useful in removing an undefined stack from error objects.
 * @returns
 */
export function omitUndefined<O extends object>(
  obj: O,
  enumerableOnly: boolean = false,
  maxDepth?: number
) {
  const seen = new Set<unknown>();
  function recursion(rObj: unknown, depth: number) {
    if (typeof maxDepth === "number") {
      if (depth > maxDepth) {
        return rObj;
      }
    }
    if (rObj === null || typeof rObj !== "object") {
      return rObj;
    }
    if (seen.has(rObj)) {
      return undefined;
    }
    seen.add(rObj);
    const result: {
      [key: string | number | symbol]: unknown;
    } = {};
    const keys = enumerableOnly
      ? Object.keys(rObj)
      : Object.getOwnPropertyNames(rObj);
    for (const key of keys) {
      if (typeof (rObj as object)[key as keyof object] !== "undefined") {
        const value = recursion(
          (rObj as object)[key as keyof object],
          depth + 1
        );
        if (typeof value !== "undefined") {
          result[key] = value;
        }
      }
    }
    return result;
  }
  return recursion(obj, 0) as O;
}

export function safeStringify(
  value: unknown,
  {
    indent,
    onFail,
  }: {
    indent?: number;
    onFail?: (error: unknown) => void;
  }
): string | undefined {
  try {
    return JSON.stringify(value, null, indent);
  } catch (e) {
    onFail?.(e);
    return undefined;
  }
}
