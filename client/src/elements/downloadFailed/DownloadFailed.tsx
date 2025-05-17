import React, { useEffect, useRef, useState } from "react";
import FgSVGElement from "../fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;
const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";

export default function DownloadFailed({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const failedContainerRef = useRef<HTMLDivElement>(null);
  const failedRef = useRef<HTMLDivElement>(null);
  const [textSize, setTextSize] = useState(1);

  useEffect(() => {
    const el = failedContainerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;

        if (height > 800) {
          setTextSize(4);
        } else if (height > 600) {
          setTextSize(3);
        } else if (height > 400) {
          setTextSize(2);
        } else if (height > 200) {
          setTextSize(1.5);
        } else if (height > 150) {
          setTextSize(1.25);
        } else if (height > 100) {
          setTextSize(1);
        } else if (height > 50) {
          setTextSize(0.5);
        } else {
          setTextSize(0.25);
        }
      }
    });

    observer.observe(el);
    return () => void observer.disconnect();
  }, []);

  return (
    <div
      ref={failedContainerRef}
      className={`${className} curvy-bg flex flex-col items-center justify-center bg-table-top-gradient`}
      style={{
        fontSize: `${textSize}rem`,
        lineHeight: `${textSize + 0.5}rem`,
      }}
      onClick={onClick}
    >
      <div
        ref={failedRef}
        className="hyphens-auto whitespace-normal px-2 py-4 text-center font-Josefin text-fg-white"
        style={{
          fontSize: `${textSize}rem`,
          lineHeight: `${textSize + 0.5}rem`,
        }}
      >
        Retry download?
      </div>
      <FgSVGElement
        className="flex aspect-square grow items-center justify-center fill-fg-white stroke-fg-white"
        style={{
          height: `calc(100% - ${failedRef.current?.clientHeight ?? 0}px)`,
        }}
        src={downloadIcon}
        attributes={[
          { key: "width", value: "40%" },
          { key: "height", value: "40%" },
        ]}
      />
    </div>
  );
}
