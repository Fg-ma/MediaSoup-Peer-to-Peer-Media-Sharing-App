import React, { useEffect, useState } from "react";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import HoverElement from "../../../../elements/hoverElement/HoverElement";
import ChunkUploader, {
  ChunkedUploadListenerTypes,
} from "../../../../tools/uploader/lib/chunkUploader/ChunkUploader";
import TextChunkUploader from "../../../../tools/uploader/lib/textChunkUploader/TextChunkUploader";
import VideoChunkUploader from "../../../../tools/uploader/lib/videoChunkUploader/VideoChunkUploader";
import FgSVGElement from "../../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const resetIcon = nginxAssetServerBaseUrl + "svgs/resetIcon.svg";

export default function LoadingElement({
  upload,
  loadingTabRef,
}: {
  upload: ChunkUploader | TextChunkUploader | VideoChunkUploader;
  loadingTabRef: React.RefObject<HTMLDivElement>;
}) {
  const [_, setRerender] = useState(false);

  const handleUploadListener = (msg: ChunkedUploadListenerTypes) => {
    switch (msg.type) {
      case "uploadProgress":
        setRerender((prev) => !prev);
        break;
      case "uploadFailed":
        setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    upload.addChunkedUploadListener(handleUploadListener);
    return () => {
      upload.removeChunkedUploadListener(handleUploadListener);
    };
  }, []);

  // Parameters for our SVG circles:
  const radius = 45;
  const innerRadius = 40;
  const circumference = 2 * Math.PI * radius;

  // Clamp in [0,1]:
  const pct = Math.min(Math.max(upload.progress, 0), 0.9999);

  const handleClick = (event: React.MouseEvent) => {
    if (upload.uploadingState === "failed") {
      event.stopPropagation();

      if (!event.ctrlKey) {
        upload.retryUpload();
      } else {
        upload.deconstructor();
      }
    }
  };

  return (
    <HoverElement
      className="aspect-square h-12 rounded-full bg-fg-off-white"
      scrollingContainer={loadingTabRef}
      content={
        <>
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            onClick={
              upload.uploadingState === "failed" ? handleClick : undefined
            }
          >
            {/* 1) Inner wedge (filled pie) */}
            {upload.uploadingState !== "failed" && (
              <path
                d={(() => {
                  // Simple wedge generator
                  const startAngle = 0;
                  const endAngle = pct * 360;
                  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
                  const cx = 50,
                    cy = 50,
                    r = innerRadius;

                  const startX = cx + r * Math.cos(toRad(startAngle));
                  const startY = cy + r * Math.sin(toRad(startAngle));
                  const endX = cx + r * Math.cos(toRad(endAngle));
                  const endY = cy + r * Math.sin(toRad(endAngle));
                  const largeArc = endAngle > 180 ? 1 : 0;

                  return [
                    `M ${cx} ${cy}`,
                    `L ${startX} ${startY}`,
                    `A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`,
                    "Z",
                  ].join(" ");
                })()}
                fill={
                  upload.uploadingState === "uploading" ? "#e62833" : "#f97c02"
                }
                stroke={
                  upload.uploadingState === "uploading" ? "#e62833" : "#f97c02"
                }
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="4"
              />
            )}

            {/* 2) Outer ring background */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#f0f0f0"
              strokeWidth="10"
            />

            {/* 3) Outer ring progress */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={
                upload.uploadingState === "uploading" ? "#d40213" : "#f6630f"
              }
              strokeWidth="10.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct)}
              transform="rotate(-90 50 50)"
            />
          </svg>
          {upload.uploadingState === "failed" && (
            <FgSVGElement
              src={resetIcon}
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
              ]}
              className="pointer-events-none absolute left-1/2 top-1/2 flex aspect-square h-[40%] -translate-x-1/2 -translate-y-1/2 items-center justify-center fill-fg-red-light stroke-fg-red-light"
            />
          )}
        </>
      }
      hoverContent={
        <FgHoverContentStandard
          content={
            <div>
              {upload.filename} (
              <span className="font-B612Mono">
                {(upload.progress * 100).toFixed(0)}
              </span>
              %)
            </div>
          }
          style="light"
        />
      }
      options={{
        hoverSpacing: 2,
        hoverType: "above",
        hoverTimeoutDuration: 750,
      }}
    />
  );
}
