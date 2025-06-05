import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../context/mediaContext/MediaContext";
import { useToolsContext } from "../../../../../context/toolsContext/ToolsContext";
import { useGeneralContext } from "../../../../../context/generalContext/GeneralContext";
import { useSignalContext } from "../../../../../context/signalContext/SignalContext";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import SvgSettingsController from "./lib/SvgSettingsController";
import FgPortal from "../../../../../elements/fgPortal/FgPortal";
import MethodSvgEditor from "../../../../../methodSvgEditor/MethodSvgEditor";
import DownloadOptionsPage from "./lib/DownloadOptionsPage";
import HoverElement from "../../../../../elements/hoverElement/HoverElement";
import { useSocketContext } from "../../../../../context/socketContext/SocketContext";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";
const editIcon = nginxAssetServerBaseUrl + "svgs/editIcon.svg";
const copyIcon = nginxAssetServerBaseUrl + "svgs/copyIcon.svg";
const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";
const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";
const navigateForward = nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function SvgSettingsPanel({
  instanceId,
  setExternalRerender,
}: {
  instanceId: string;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { staticContentMedia } = useMediaContext();
  const { currentSettingsActive } = useGeneralContext();
  const { sendSettingsSignal, sendGroupSignal } = useSignalContext();
  const { uploader } = useToolsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const svgMediaInstance = useRef(
    staticContentMedia.current.svg.tableInstances[instanceId],
  );

  const [downloadOptionsActive, setDownloadOptionsActive] = useState(false);
  const [editing, setEditing] = useState(false);
  const [_, setRerender] = useState(false);
  const filenameRef = useRef<HTMLDivElement>(null);

  const svgSettingsController = new SvgSettingsController(
    svgMediaInstance,
    setEditing,
    setDownloadOptionsActive,
    setRerender,
    tableStaticContentSocket,
    sendGroupSignal,
  );

  useEffect(() => {
    svgMediaInstance.current =
      staticContentMedia.current.svg.tableInstances[instanceId];

    setDownloadOptionsActive(false);

    setRerender((prev) => !prev);
  }, [instanceId]);

  return (
    <>
      <div
        className="mx-6 my-4 flex h-max max-w-[320px] flex-col items-center justify-center space-y-1 rounded border border-fg-white bg-fg-tone-black-8 px-2 py-2 font-K2D text-fg-white"
        style={{ width: "calc(100% - 3rem)" }}
      >
        <div className="flex h-7 w-full items-center justify-start px-1">
          <FgButton
            className="mr-2 flex h-full items-center justify-center"
            contentFunction={() => (
              <FgSVGElement
                src={closeIcon}
                className="aspect-square h-[55%] fill-fg-white stroke-fg-white"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
            )}
            clickFunction={() => {
              const idx = currentSettingsActive.current.findIndex(
                (active) =>
                  "svg" === active.contentType &&
                  instanceId === active.instanceId,
              );

              if (idx !== -1) {
                currentSettingsActive.current.splice(idx, 1);
                sendSettingsSignal({
                  type: "sidePanelChanged",
                });
                setExternalRerender((prev) => !prev);
              }
            }}
            hoverContent={
              <FgHoverContentStandard
                content={"Close settings"}
                style="light"
              />
            }
            options={{
              hoverSpacing: 4,
              hoverTimeoutDuration: 3500,
              hoverType: "above",
            }}
          />
          <HoverElement
            externalRef={filenameRef}
            className="truncate py-1 font-Josefin text-2xl text-fg-white underline decoration-fg-red-light underline-offset-4"
            style={{ width: "calc(100% - 2.25rem)" }}
            content={<>{svgMediaInstance.current.svgMedia.filename}</>}
            hoverContent={
              (filenameRef.current?.scrollWidth ?? 0) >
              (filenameRef.current?.clientWidth ?? 0) ? (
                <FgHoverContentStandard
                  style="light"
                  content={svgMediaInstance.current.svgMedia.filename}
                />
              ) : undefined
            }
            options={{
              hoverSpacing: 4,
              hoverType: "above",
              hoverTimeoutDuration: 750,
            }}
          />
        </div>
        <FgButton
          className="h-7 w-full"
          contentFunction={() => (
            <div
              className={`${
                svgMediaInstance.current.settings.synced.value
                  ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                  : "fill-fg-white stroke-fg-white"
              } flex h-full w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
            >
              <FgSVGElement
                src={
                  svgMediaInstance.current.settings.synced.value
                    ? desyncIcon
                    : syncIcon
                }
                className="mr-2 flex aspect-square h-full items-center justify-center"
                attributes={[
                  { key: "width", value: "80%" },
                  { key: "height", value: "80%" },
                ]}
              />
              <div className="truncate">
                {svgMediaInstance.current.settings.synced.value
                  ? "Desync"
                  : "Sync"}
              </div>
            </div>
          )}
          clickFunction={svgSettingsController.handleSync}
          hoverContent={
            <FgHoverContentStandard
              content={
                svgMediaInstance.current.settings.synced.value
                  ? "Desync (h)"
                  : "Sync (h)"
              }
              style="light"
            />
          }
          options={{
            hoverSpacing: 4,
            hoverTimeoutDuration: 3500,
            hoverType: "above",
          }}
        />
        <FgButton
          className="h-7 w-full"
          contentFunction={() => (
            <div
              className={`${
                svgMediaInstance.current.settings.background.value
                  ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                  : "fill-fg-white stroke-fg-white"
              } flex h-full w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
            >
              <FgSVGElement
                src={backgroundIcon}
                className="mr-2 flex aspect-square h-full items-center justify-center"
                attributes={[
                  { key: "width", value: "80%" },
                  { key: "height", value: "80%" },
                ]}
              />
              <div className="truncate">
                {svgMediaInstance.current.settings.background.value
                  ? "Remove from background"
                  : "Set as background"}
              </div>
            </div>
          )}
          clickFunction={svgSettingsController.handleSetAsBackground}
          hoverContent={
            <FgHoverContentStandard
              content="Set as background (b)"
              style="light"
            />
          }
          options={{
            hoverSpacing: 4,
            hoverTimeoutDuration: 3500,
            hoverType: "above",
          }}
        />
        {svgMediaInstance.current.svgMedia.fileSize < 1024 * 1024 && (
          <FgButton
            className="h-7 w-full"
            contentFunction={() => (
              <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                <FgSVGElement
                  src={editIcon}
                  className="mr-2 flex aspect-square h-full items-center justify-center"
                  attributes={[
                    { key: "width", value: "80%" },
                    { key: "height", value: "80%" },
                  ]}
                />
                <div className="truncate">Edit</div>
              </div>
            )}
            clickFunction={svgSettingsController.handleEdit}
            hoverContent={
              <FgHoverContentStandard content="Edit (q)" style="light" />
            }
            options={{
              hoverSpacing: 4,
              hoverTimeoutDuration: 3500,
              hoverType: "above",
            }}
          />
        )}
        <FgButton
          className="h-7 w-full"
          contentFunction={() => (
            <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
              <FgSVGElement
                src={downloadIcon}
                className="mr-2 flex aspect-square h-full items-center justify-center"
                attributes={[
                  { key: "width", value: "85%" },
                  { key: "height", value: "85%" },
                ]}
              />
              <div className="truncate">Download</div>
            </div>
          )}
          clickFunction={svgSettingsController.handleDownload}
          hoverContent={
            <FgHoverContentStandard content="Download (d)" style="light" />
          }
          options={{
            hoverSpacing: 4,
            hoverTimeoutDuration: 3500,
            hoverType: "above",
          }}
        />
        <FgButton
          className="h-7 w-full"
          contentFunction={() => (
            <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
              <FgSVGElement
                src={copyIcon}
                className="mr-2 flex aspect-square h-full items-center justify-center"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
              <div className="truncate">Copy to clipboard</div>
            </div>
          )}
          clickFunction={svgSettingsController.handleCopyToClipBoard}
          hoverContent={
            <FgHoverContentStandard
              content="Copy to clipboard (c)"
              style="light"
            />
          }
          options={{
            hoverSpacing: 4,
            hoverTimeoutDuration: 3500,
            hoverType: "above",
          }}
        />
        <FgButton
          className="h-7 w-full"
          contentFunction={() => (
            <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
              <FgSVGElement
                src={navigateForward}
                className={`${downloadOptionsActive ? "-scale-x-100" : ""} mr-2 flex aspect-square h-[80%] rotate-90 items-center justify-center`}
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
              <div className="truncate">Download options</div>
            </div>
          )}
          clickFunction={svgSettingsController.handleDownloadOptionsActive}
          hoverContent={
            <FgHoverContentStandard
              content={
                downloadOptionsActive
                  ? "Close download options"
                  : "Open download options"
              }
              style="light"
            />
          }
          options={{
            hoverSpacing: 4,
            hoverTimeoutDuration: 3500,
            hoverType: "above",
          }}
        />
        {downloadOptionsActive && (
          <DownloadOptionsPage svgMediaInstance={svgMediaInstance} />
        )}
      </div>
      {svgMediaInstance.current.svgMedia.fileSize < 1024 * 1024 &&
        editing &&
        svgMediaInstance.current.svgMedia.svg && (
          <FgPortal
            type="staticTopDomain"
            top={0}
            left={0}
            zValue={490000}
            className="flex h-full w-full items-center justify-center bg-fg-tone-black-1 bg-opacity-45"
            content={
              <MethodSvgEditor
                editing={editing}
                initialSVGString={() => {
                  if (svgMediaInstance.current.svgMedia.svg) {
                    // Create a deep clone of the original svg element
                    const clonedSVG =
                      svgMediaInstance.current.svgMedia.svg.cloneNode(
                        true,
                      ) as HTMLElement;

                    // Modify the clone
                    clonedSVG.setAttribute("width", "100");
                    clonedSVG.setAttribute("height", "");

                    // Serialize the cloned SVG to a string
                    return new XMLSerializer().serializeToString(clonedSVG);
                  }
                }}
                finishCallback={async (svg) => {
                  setEditing(false);

                  const svgMatch = svg.match(/<svg[\s\S]*<\/svg>/);
                  if (!svgMatch) {
                    console.error("Malformed SVG received:", svg);
                    return;
                  }

                  const cleanSvgText = svgMatch[0];

                  const blob = new Blob([cleanSvgText], {
                    type: "image/svg+xml",
                  });

                  const file = new File(
                    [blob],
                    svgMediaInstance.current.svgMedia.filename,
                    {
                      type: "image/svg+xml",
                    },
                  );

                  uploader.current?.reuploadTableContent(
                    file,
                    svgMediaInstance.current.svgMedia.svgId,
                  );
                }}
                cancelCallback={() => {
                  setEditing(false);
                }}
              />
            }
            options={{ animate: false }}
          />
        )}
    </>
  );
}
