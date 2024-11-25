export function capitalizeFirstLetter(text: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function areArraysEqual(array1: number[], array2: number[]) {
  if (array1?.length !== array2?.length) {
    return false;
  }
  return [...array1].sort((a, b) => a - b).every((value, index) => value === [...array2].sort((a, b) => a - b)[index]);
}
