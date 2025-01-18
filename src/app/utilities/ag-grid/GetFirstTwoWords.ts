export function getFirstTwoWords(suppliersName: string): string {
  if (suppliersName) {
    // Check if params.value is not null or undefined
    const fullString = suppliersName;
    const words = fullString.split(" ");
    const firstTwoWords = words.slice(0, 2).join(" ");
    return firstTwoWords;
  } else {
    // Return a default value or an empty string if params.value is null or undefined
    return "";
  }
}
