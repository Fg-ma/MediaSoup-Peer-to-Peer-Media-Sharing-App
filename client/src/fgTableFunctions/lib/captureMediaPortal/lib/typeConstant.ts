const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const cameraIcon = nginxAssetSeverBaseUrl + "svgs/cameraIcon.svg";
const videoIcon = nginxAssetSeverBaseUrl + "svgs/videoIcon.svg";
const icon10s = nginxAssetSeverBaseUrl + "svgs/10sIcon.svg";
const icon15s = nginxAssetSeverBaseUrl + "svgs/15sIcon.svg";
const icon30s = nginxAssetSeverBaseUrl + "svgs/30sIcon.svg";
const icon60s = nginxAssetSeverBaseUrl + "svgs/60sIcon.svg";

export type CaptureMediaTypes =
  | "camera"
  | "video"
  | "10s"
  | "15s"
  | "30s"
  | "60s";

export const captureMediaTypeMeta: {
  [captureMediaType in CaptureMediaTypes]: { icon: string; title: string };
} = {
  camera: { icon: cameraIcon, title: "Camera" },
  video: { icon: videoIcon, title: "Video" },
  "10s": { icon: icon10s, title: "10 seconds" },
  "15s": { icon: icon15s, title: "15 seconds" },
  "30s": { icon: icon30s, title: "30 seconds" },
  "60s": { icon: icon60s, title: "60 seconds" },
};
