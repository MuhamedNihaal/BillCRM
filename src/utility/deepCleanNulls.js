export function deepCleanNulls(obj) {
  if (Array.isArray(obj)) {
    const allPrimitives = obj.every(
      (item) =>
        item === null ||
        typeof item !== "object" ||
        item instanceof Date ||
        Array.isArray(item),
    );

    if (allPrimitives) {
      return obj.filter((item) => item != null);
    }

    return obj
      .map(deepCleanNulls)
      .filter(
        (item) =>
          item != null &&
          (typeof item !== "object" || Object.keys(item).length > 0),
      );
  } else if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => value != null)
        .map(([key, value]) => [key, deepCleanNulls(value)])
        .filter(
          ([_, value]) =>
            !(
              typeof value === "object" &&
              !Array.isArray(value) &&
              Object.keys(value).length === 0
            ),
        ),
    );
  }

  return obj;
}
