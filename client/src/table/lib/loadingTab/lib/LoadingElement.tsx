import React, { useEffect, useState } from "react";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import HoverElement from "../../../../elements/hoverElement/HoverElement";
import ChunkUploader, {
  ChunkedUploadListenerTypes,
} from "../../../../tools/uploader/lib/chunkUploader/ChunkUploader";
import TextChunkUploader from "../../../../tools/uploader/lib/textChunkUploader/TextChunkUploader";

export default function LoadingElement({
  upload,
  loadingTabRef,
}: {
  upload: ChunkUploader | TextChunkUploader;
  loadingTabRef: React.RefObject<HTMLDivElement>;
}) {
  const [_, setRerender] = useState(false);

  const handleUploadListener = (msg: ChunkedUploadListenerTypes) => {
    if (msg.type === "uploadProgress") {
      setRerender((v) => !v);
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
  const pct = Math.min(Math.max(upload.progress, 0), 1);

  return (
    <HoverElement
      className="aspect-square h-12 rounded-full bg-fg-off-white"
      scrollingContainer={loadingTabRef}
      content={
        <svg className="h-full w-full" viewBox="0 0 100 100">
          {/* 1) Inner wedge (filled pie) */}
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
            fill="#e62833"
            stroke="#e62833"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="4"
          />

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
            stroke="#d40213"
            strokeWidth="10.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            transform="rotate(-90 50 50)"
          />
        </svg>
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
