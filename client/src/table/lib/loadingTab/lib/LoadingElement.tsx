import React, { useEffect, useState } from "react";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import HoverElement from "../../../../elements/hoverElement/HoverElement";
import { useUploadContext } from "../../../../context/uploadContext/UploadContext";
import {
  TableUpload,
  UploadSignals,
} from "../../../../context/uploadContext/lib/typeConstant";

export default function LoadingElement({
  contentId,
  upload,
  loadingTabRef,
}: {
  contentId: string;
  upload: TableUpload;
  loadingTabRef: React.RefObject<HTMLDivElement>;
}) {
  const {
    addUploadSignalListener,
    removeUploadSignalListener,
    getCurrentUploads,
  } = useUploadContext();

  const [_, setRerender] = useState(false);

  const polarToCartesian = (angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees + 90) * Math.PI) / 180.0;
    return {
      x: 50 + 45 * Math.cos(angleInRadians),
      y: 50 + 45 * Math.sin(angleInRadians),
    };
  };

  const describeArc = (endAngle: number) => {
    const start = polarToCartesian(endAngle);
    const end = polarToCartesian(0);

    const largeArcFlag = endAngle <= 180 ? "0" : "1";

    return [
      "M",
      50,
      50,
      "L",
      start.x,
      start.y,
      "A",
      45,
      45,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  };

  const handleUploadListener = (signal: UploadSignals) => {
    if (signal.header.contentId !== contentId) return;

    switch (signal.type) {
      case "uploadProgress":
        setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    addUploadSignalListener(handleUploadListener);

    return () => {
      removeUploadSignalListener(handleUploadListener);
    };
  }, []);

  return (
    <HoverElement
      className="aspect-square h-12 rounded-full bg-fg-off-white"
      scrollingContainer={loadingTabRef}
      content={
        <svg className="h-full w-full fill-fg-red" viewBox="0 0 100 100">
          <mask id="arcMask1">
            <circle cx="50" cy="50" r="100" fill="white" />
            <circle cx="50" cy="50" r="40" fill="black" />
          </mask>

          <path
            d={describeArc(
              (getCurrentUploads()[contentId]?.progress ?? 0) * 359.99,
            )}
            fill="#d40213"
            stroke="#d40213"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            mask="url(#arcMask1)"
          />

          <mask id="arcMask2">
            <circle cx="50" cy="50" r="100" fill="black" />
            <circle cx="50" cy="50" r="40" fill="white" />
          </mask>

          <path
            d={describeArc(
              (getCurrentUploads()[contentId]?.progress ?? 0) * 359.99,
            )}
            fill="#e62833"
            stroke="#e62833"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            mask="url(#arcMask2)"
          />
        </svg>
      }
      hoverContent={
        <FgHoverContentStandard
          content={
            <div>
              {upload.filename} (
              <span className="font-B612Mono">
                {(getCurrentUploads()[contentId]?.progress * 100).toFixed(0)}
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
