export function capitalizeFirstLetter(text: string | undefined) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

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

export const formatDate = (date: string | Date | null | undefined, withTime = false) => {
  if (!date) return "";
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  };
  return new Intl.DateTimeFormat("de-CH", options).format(new Date(date));
};
