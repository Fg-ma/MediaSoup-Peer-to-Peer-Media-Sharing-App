import React, { useEffect, useRef, useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import TableSvgMediaInstance from "../../../../../../media/fgTableSvg/TableSvgMediaInstance";
import MimeTypePage from "./MimeTypePage";
import SizePage from "./SizePage";
import CompressionPage from "./CompressionPage";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function DownloadOptionsPage({
  svgMediaInstance,
}: {
  svgMediaInstance: React.MutableRefObject<TableSvgMediaInstance>;
}) {
  const [isMimeTypePage, setIsMimeTypePage] = useState(false);
  const [isSizePage, setIsSizePage] = useState(false);
  const [isCompressionPage, setIsCompressionPage] = useState(false);
  const mimeTypeLabelRef = useRef<HTMLDivElement>(null);
  const sizeLabelRef = useRef<HTMLDivElement>(null);
  const compressionLabelRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  useEffect(() => {
    setRerender((prev) => !prev);
  }, []);

  return (
    <>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-red-light"></div>
      <FgButton
        className="h-8 w-full"
        clickFunction={() => setIsMimeTypePage((prev) => !prev)}
        contentFunction={() => (
          <div className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <div ref={mimeTypeLabelRef}>Mime type</div>
            <div
              className="flex items-center justify-center space-x-2"
              style={{
                width: `calc(100% - ${mimeTypeLabelRef.current?.clientWidth ?? 0}px - 1rem)`,
              }}
            >
              <div
                className="truncate text-end"
                style={{ width: "calc(100% - 1.25rem)" }}
              >
                {
                  svgMediaInstance.current.settings.downloadOptions.mimeType
                    .value
                }
              </div>
              <FgSVGElement
                className={`${isMimeTypePage ? "-scale-x-100" : ""} rotate-90`}
                src={navigateForwardIcon}
                attributes={[
                  { key: "width", value: "1.25rem" },
                  { key: "height", value: "1.25rem" },
                ]}
              />
            </div>
          </div>
        )}
      />
      {isMimeTypePage && (
        <MimeTypePage
          svgMediaInstance={svgMediaInstance}
          setRerender={setRerender}
        />
      )}
      <FgButton
        className="h-8 w-full"
        clickFunction={() => setIsSizePage((prev) => !prev)}
        contentFunction={() => (
          <div className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <div ref={sizeLabelRef}>Size</div>
            <div
              className="flex items-center justify-center space-x-2"
              style={{
                width: `calc(100% - ${sizeLabelRef.current?.clientWidth ?? 0}px - 1rem)`,
              }}
            >
              <div
                className="truncate text-end"
                style={{ width: "calc(100% - 1.25rem)" }}
              >
                {`${parseFloat(
                  svgMediaInstance.current.settings.downloadOptions.size.width.value.toFixed(
                    0,
                  ),
                )}x${parseFloat(
                  svgMediaInstance.current.settings.downloadOptions.size.height.value.toFixed(
                    0,
                  ),
                )}`}
              </div>
              <FgSVGElement
                className={`${isSizePage ? "-scale-x-100" : ""} rotate-90`}
                src={navigateForwardIcon}
                attributes={[
                  { key: "width", value: "1.25rem" },
                  { key: "height", value: "1.25rem" },
                ]}
              />
            </div>
          </div>
        )}
      />
      {isSizePage && (
        <SizePage
          svgMediaInstance={svgMediaInstance}
          setRerender={setRerender}
        />
      )}
      <FgButton
        className="h-8 w-full"
        clickFunction={() => setIsCompressionPage((prev) => !prev)}
        contentFunction={() => (
          <div className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <div ref={compressionLabelRef}>Squash</div>
            <div
              className="flex items-center justify-center space-x-2"
              style={{
                width: `calc(100% - ${compressionLabelRef.current?.clientWidth ?? 0}px - 1rem)`,
              }}
            >
              <div
                className="truncate text-end"
                style={{ width: "calc(100% - 1.25rem)" }}
              >
                {
                  svgMediaInstance.current.settings.downloadOptions.compression
                    .value
                }
              </div>
              <FgSVGElement
                className={`${isCompressionPage ? "-scale-x-100" : ""} rotate-90`}
                src={navigateForwardIcon}
                attributes={[
                  { key: "width", value: "1.25rem" },
                  { key: "height", value: "1.25rem" },
                ]}
              />
            </div>
          </div>
        )}
      />
      {isCompressionPage && (
        <CompressionPage
          svgMediaInstance={svgMediaInstance}
          setRerender={setRerender}
        />
      )}
    </>
  );
}
