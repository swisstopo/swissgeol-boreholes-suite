import { ApiError } from "./apiInterfaces.ts";
import { fetchApiV2Base } from "./fetchApiV2.ts";

const getFallbackFileName = (url: string): string => {
  const match = /export\/(\w+)\?/.exec(url);
  if (!match) return "export";
  return `export.${match[1]}`;
};

const getFileName = (response: Response, fallback: string): string =>
  response.headers.get("content-disposition")?.split("; ")[1]?.replace("filename=", "") ?? fallback;

export async function download(url: string): Promise<Response> {
  const response = await fetchApiV2Base(url, "GET", null);
  if (!response.ok) {
    throw new ApiError("errorOccurredWhileFetchingFileFromCloudStorage", response.status);
  }
  const blob = await response.blob();
  downloadDataFromBlob(blob, getFileName(response, getFallbackFileName(url)));
  return response;
}

export async function downloadPost(url: string, body: object): Promise<Response> {
  const response = await fetchApiV2Base(url, "POST", JSON.stringify(body), "application/json");
  if (!response.ok) {
    throw new ApiError("errorOccurredWhileFetchingFileFromCloudStorage", response.status);
  }
  const blob = await response.blob();
  downloadDataFromBlob(blob, getFileName(response, getFallbackFileName(url)));
  return response;
}

export const downloadData = (dataString: string, fileName: string, type: string) => {
  const blob = new Blob([dataString], { type: type });
  downloadDataFromBlob(blob, fileName);
};

const downloadDataFromBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const downloadCodelistCsv = (): Promise<Response> => download(`codelist/csv`);
