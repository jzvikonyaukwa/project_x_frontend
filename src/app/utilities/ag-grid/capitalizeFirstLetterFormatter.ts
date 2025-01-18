export function capitalizeFirstLetter(value): string {
  if (typeof value !== "string") {
    // Handle non-string values appropriately
    // For example, convert to string or return as is
    return value;
  }

  return value
    .toLowerCase()
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
