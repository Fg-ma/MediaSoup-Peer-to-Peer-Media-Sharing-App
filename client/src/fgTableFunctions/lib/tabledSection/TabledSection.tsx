import React, { useRef, useState } from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { useSignalContext } from "../../../context/signalContext/SignalContext";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgPanel from "../../../elements/fgPanel/FgPanel";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LazyScrollingContainer from "../../../elements/lazyScrollingContainer/LazyScrollingContainer";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const tableTopReducedLineIcon =
  nginxAssetServerBaseUrl + "svgs/tableTopReducedLineIcon.svg";
const tableTopReducedTippedLineIcon =
  nginxAssetServerBaseUrl + "svgs/tableTopReducedTippedLineIcon.svg";

export default function TabledSection({
  tabledSectionRef,
  dragging,
  setDragging,
}: {
  tabledSectionRef: React.RefObject<HTMLDivElement>;
  dragging: boolean;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userMedia } = useMediaContext();
  const { sendSignal } = useSignalContext();

  const [tabledActive, setTabledActive] = useState(false);
  const [cols, setCols] = useState(3);
  const tabledButtonRef = useRef<HTMLButtonElement>(null);

  const gridColumnsChange = () => {
    if (!tabledSectionRef.current) return;

    const width = tabledSectionRef.current.clientWidth;
    if (width < 300) {
      if (cols !== 3) setCols(3);
    } else if (width < 500) {
      if (cols !== 4) setCols(4);
    } else if (width < 700) {
      if (cols !== 5) setCols(5);
    } else if (width >= 700) {
      if (cols !== 6) setCols(6);
    }
  };

  return (
    <>
      <FgButton
        externalRef={tabledButtonRef}
        clickFunction={() => setTabledActive((prev) => !prev)}
        className="flex aspect-square h-full items-center justify-center"
        contentFunction={() => {
          return (
            <FgSVGElement
              src={
                tabledActive
                  ? tableTopReducedTippedLineIcon
                  : tableTopReducedLineIcon
              }
              className="aspect-square h-full"
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
                { key: "fill", value: "black", id: "joystickBottom" },
                { key: "stroke", value: "black" },
                ...(tabledActive
                  ? [{ key: "fill", value: "#e62833", id: "joystickTop" }]
                  : [
                      {
                        key: "fill",
                        value: "none",
                        id: "joystickTop",
                      },
                    ]),
              ]}
            />
          );
        }}
        hoverContent={
          <FgHoverContentStandard
            content={
              tabledActive ? "Close tabled content" : "Open tabled content"
            }
          />
        }
        options={{ hoverTimeoutDuration: 750, hoverZValue: 500000000000 }}
        aria-label={"Tabled content"}
      />
      {tabledActive && (
        <FgPanel
          className={`${dragging ? "!opacity-0 transition-opacity" : ""}`}
          content={
            <LazyScrollingContainer
              externalRef={tabledSectionRef}
              className={`small-vertical-scroll-bar grid h-full min-h-[9.5rem] w-full min-w-[9.5rem] gap-1 overflow-y-auto py-2 ${
                cols === 3
                  ? "grid-cols-3"
                  : cols === 4
                    ? "grid-cols-4"
                    : cols === 5
                      ? "grid-cols-5"
                      : "grid-cols-6"
              }`}
              items={[
                ...Object.entries(userMedia.current.svg.all).map(
                  ([svgId, svgMedia]) =>
                    svgMedia.state.includes("tabled") ? (
                      <FgButton
                        key={svgId}
                        className="flex aspect-square min-w-12 max-w-24 items-center justify-center rounded border-2 border-gray-300 hover:border-3 hover:border-fg-secondary"
                        contentFunction={
                          svgMedia.blobURL
                            ? () => (
                                <img
                                  className="aspect-square h-full object-contain"
                                  src={svgMedia.blobURL}
                                  alt={svgMedia.filename}
                                />
                              )
                            : undefined
                        }
                        startDragFunction={() => {
                          setDragging(true);

                          sendSignal({
                            type: "startInstancesDrag",
                            data: {
                              instances: [
                                {
                                  contentId: svgMedia.svgId,
                                  height: 15,
                                  width: 15 * (svgMedia.aspect ?? 1),
                                },
                              ],
                            },
                          });
                        }}
                        dragFunction={(_, event) => {}}
                        stopDragFunction={() => {
                          setDragging(false);

                          sendSignal({
                            type: "stopInstancesDrag",
                            data: {
                              contentIds: [svgMedia.svgId],
                            },
                          });
                        }}
                        options={{ dragPreventDefault: true }}
                      />
                    ) : null,
                ),
                ...Object.entries(userMedia.current.image.all).map(
                  ([imageId, imageMedia]) =>
                    imageMedia.state.includes("tabled") && (
                      <FgButton
                        key={imageId}
                        className="flex aspect-square min-w-12 max-w-24 items-center justify-center rounded border-2 border-gray-300 hover:border-3 hover:border-fg-secondary"
                        contentFunction={
                          imageMedia.blobURL
                            ? () => (
                                <img
                                  className="aspect-square h-full object-contain"
                                  src={imageMedia.blobURL}
                                  alt={imageMedia.filename}
                                />
                              )
                            : undefined
                        }
                      />
                    ),
                ),
              ]}
            />
          }
          initPosition={{
            referenceElement: tabledButtonRef.current ?? undefined,
            placement: "above",
            padding: 8,
          }}
          initWidth={"278px"}
          initHeight={"268px"}
          minWidth={204}
          minHeight={190}
          resizeCallback={gridColumnsChange}
          closeCallback={() => setTabledActive(false)}
          closePosition="topRight"
          shadow={{ top: true, bottom: true }}
        />
      )}
    </>
  );
}
