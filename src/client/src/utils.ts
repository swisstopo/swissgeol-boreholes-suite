export function capitalizeFirstLetter(text: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const formatWithThousandSeparator = (value: number | null, minDecimals = 0): string => {
  if (value == null) return "-";

  // Format number using de-CH
  const formatted = new Intl.NumberFormat("de-CH", {
    useGrouping: true,
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: 4,
  }).format(value);
  // Ensure thousand separators are always a standard single quote (')
  return formatted.replace(/’/g, "'");
};

export const downloadData = (dataString: string, fileName: string, type: string) => {
  const blob = new Blob([dataString], { type: type });
  downloadDataFromBlob(blob, fileName);
};

export const downloadDataFromBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
