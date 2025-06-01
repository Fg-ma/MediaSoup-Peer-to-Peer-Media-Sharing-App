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
  const mimeTypeButtonRef = useRef<HTMLDivElement>(null);
  const sizeButtonRef = useRef<HTMLDivElement>(null);
  const compressionButtonRef = useRef<HTMLDivElement>(null);

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
          <div
            ref={mimeTypeButtonRef}
            className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1"
          >
            <div>Mime type</div>
            <div className="flex items-center justify-center space-x-2">
              {(mimeTypeButtonRef.current?.clientWidth ?? 0) >= 160 && ( // bad very bad
                <div>
                  {
                    svgMediaInstance.current.settings.downloadOptions.mimeType
                      .value
                  }
                </div>
              )}
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
          <div
            ref={sizeButtonRef}
            className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1"
          >
            <div>Size</div>
            <div className="flex items-center justify-center space-x-2">
              {(sizeButtonRef.current?.clientWidth ?? 0) >= 170 && (
                <div>
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
              )}
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
          <div
            ref={compressionButtonRef}
            className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1"
          >
            <div>Squash</div>
            <div className="flex items-center justify-center space-x-2">
              {(compressionButtonRef.current?.clientWidth ?? 0) >= 150 && (
                <div>
                  {
                    svgMediaInstance.current.settings.downloadOptions
                      .compression.value
                  }
                </div>
              )}
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
