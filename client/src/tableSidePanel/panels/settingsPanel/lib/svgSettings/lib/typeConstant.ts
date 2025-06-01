export type DownloadMimeTypes =
  | "svg"
  | "svgz"
  | "jpg"
  | "png"
  | "webp"
  | "tiff"
  | "heic";

export type DownloadSizeTypes = "256" | "512" | "1024" | "2048" | "4096";

export type DownloadCompressionTypes = "Minified" | "Plain" | "Zipped";

export const downloadOptionsArrays: {
  mimeType: DownloadMimeTypes[];
  size: DownloadSizeTypes[];
  compression: DownloadCompressionTypes[];
} = {
  mimeType: ["svg", "svgz", "jpg", "png", "webp", "tiff", "heic"],
  size: ["256", "512", "1024", "2048", "4096"],
  compression: ["Minified", "Plain", "Zipped"],
};
