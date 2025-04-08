import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { useSignalContext } from "../../../context/signalContext/SignalContext";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgPanel from "../../../elements/fgPanel/FgPanel";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LazyScrollingContainer from "../../../elements/lazyScrollingContainer/LazyScrollingContainer";
import { StaticContentTypes } from "../../../../../universal/contentTypeConstant";

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
  const selected = useRef<
    { contentType: StaticContentTypes; contentId: string; aspect: number }[]
  >([]);
  const tabledSectionScrollingContainerRef = useRef<HTMLDivElement>(null);
  const tabledButtonRef = useRef<HTMLButtonElement>(null);
  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);
  const lastPressed = useRef<
    | { contentType: StaticContentTypes; contentId: string; aspect: number }
    | undefined
  >(undefined);

  const [_, setRerender] = useState(false);

  const gridColumnsChange = () => {
    if (!tabledSectionScrollingContainerRef.current) return;

    const width = tabledSectionScrollingContainerRef.current.clientWidth;
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

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case "shift":
        shiftPressed.current = true;
        break;
      case "control":
        controlPressed.current = true;
        break;
      default:
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case "shift":
        shiftPressed.current = false;
        break;
      case "control":
        controlPressed.current = false;
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

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
          externalRef={tabledSectionRef}
          className={`${dragging ? "!opacity-0 transition-opacity" : ""}`}
          content={
            <LazyScrollingContainer
              externalRef={tabledSectionScrollingContainerRef}
              className={`small-vertical-scroll-bar grid h-full min-h-[9.5rem] w-full min-w-[9.5rem] gap-1 overflow-y-auto py-2 ${
                cols === 3
                  ? "grid-cols-3"
                  : cols === 4
                    ? "grid-cols-4"
                    : cols === 5
                      ? "grid-cols-5"
                      : "grid-cols-6"
              }`}
              clickFunction={(event) => {
                if (event.target === event.currentTarget) {
                  selected.current = [];
                  setRerender((prev) => !prev);
                }
              }}
              items={[
                ...Object.entries(userMedia.current.svg.all).map(
                  ([svgId, svgMedia]) =>
                    svgMedia.state.includes("tabled") ? (
                      <FgButton
                        key={svgId}
                        className={`${selected.current.some((item) => item.contentId === svgId) ? "border-fg-red" : "border-transparent"} flex aspect-square w-full min-w-12 max-w-24 items-center justify-center rounded border-3 hover:border-fg-red`}
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
                        clickFunction={() => {
                          let newSelected: {
                            contentType: StaticContentTypes;
                            contentId: string;
                            aspect: number;
                          }[];

                          const currentlyActive = selected.current.some(
                            (item) => item.contentId === svgId,
                          );

                          const newEntry: {
                            contentType: StaticContentTypes;
                            contentId: string;
                            aspect: number;
                          } = {
                            contentType: "svg",
                            contentId: svgId,
                            aspect: svgMedia.aspect ?? 1,
                          };

                          if (shiftPressed.current) {
                            if (
                              lastPressed.current &&
                              lastPressed.current.contentId !== svgId
                            ) {
                              const buttons =
                                tabledSectionScrollingContainerRef.current?.querySelectorAll(
                                  "button[data-tabled-id]",
                                ) || [];

                              const buttonIds = Array.from(buttons).map(
                                (btn) => (btn as HTMLElement).dataset.tabledId,
                              );

                              const startIdx = buttonIds.indexOf(
                                lastPressed.current.contentId,
                              );
                              const endIdx = buttonIds.indexOf(svgId);

                              if (startIdx !== -1 && endIdx !== -1) {
                                const [from, to] = [startIdx, endIdx].sort(
                                  (a, b) => a - b,
                                );
                                const idsInRange = buttonIds.slice(
                                  from,
                                  to + 1,
                                );

                                newSelected = idsInRange
                                  .map((id) => {
                                    const foundButton =
                                      tabledSectionScrollingContainerRef.current?.querySelector(
                                        `button[data-tabled-id="${id}"]`,
                                      ) as HTMLButtonElement;

                                    if (!foundButton) return null;

                                    const aspect = parseFloat(
                                      foundButton?.dataset.tabledAspect ?? "1",
                                    );
                                    const contentType =
                                      foundButton?.dataset.tabledContentType;

                                    if (!contentType || isNaN(aspect))
                                      return null;

                                    return {
                                      contentType,
                                      contentId: id!,
                                      aspect,
                                    };
                                  })
                                  .filter(
                                    (
                                      item,
                                    ): item is {
                                      contentType: StaticContentTypes;
                                      contentId: string;
                                      aspect: number;
                                    } => item !== null,
                                  );
                              } else {
                                newSelected = [newEntry];
                              }

                              lastPressed.current = newEntry;
                            } else {
                              // Toggle single
                              lastPressed.current = currentlyActive
                                ? undefined
                                : newEntry;
                              newSelected = currentlyActive ? [] : [newEntry];
                            }
                          } else if (controlPressed.current) {
                            lastPressed.current = currentlyActive
                              ? undefined
                              : {
                                  contentType: "svg",
                                  contentId: svgId,
                                  aspect: svgMedia.aspect ?? 1,
                                };

                            newSelected = currentlyActive
                              ? selected.current.filter(
                                  (item) => item.contentId !== svgId,
                                )
                              : [
                                  ...selected.current,
                                  {
                                    contentType: "svg",
                                    contentId: svgId,
                                    aspect: svgMedia.aspect ?? 1,
                                  },
                                ];
                          } else {
                            lastPressed.current = currentlyActive
                              ? undefined
                              : {
                                  contentType: "svg",
                                  contentId: svgId,
                                  aspect: svgMedia.aspect ?? 1,
                                };

                            newSelected = currentlyActive
                              ? []
                              : [
                                  {
                                    contentType: "svg",
                                    contentId: svgId,
                                    aspect: svgMedia.aspect ?? 1,
                                  },
                                ];
                          }

                          selected.current = newSelected;
                          setRerender((prev) => !prev);
                        }}
                        startDragFunction={() => {
                          setDragging(true);

                          lastPressed.current = {
                            contentType: "svg",
                            contentId: svgId,
                            aspect: svgMedia.aspect ?? 1,
                          };

                          const newSelected: {
                            contentType: StaticContentTypes;
                            contentId: string;
                            aspect: number;
                          }[] = selected.current.some(
                            (item) => item.contentId === svgId,
                          )
                            ? selected.current
                            : [
                                ...selected.current,
                                {
                                  contentType: "svg",
                                  contentId: svgId,
                                  aspect: svgMedia.aspect ?? 1,
                                },
                              ];

                          selected.current = newSelected;
                          setRerender((prev) => !prev);

                          sendSignal({
                            type: "startInstancesDrag",
                            data: {
                              instances: newSelected.map((sel) => ({
                                contentType: sel.contentType,
                                contentId: sel.contentId,
                                height: 15,
                                width: 15 * sel.aspect,
                              })),
                            },
                          });
                        }}
                        stopDragFunction={() => {
                          setDragging(false);

                          sendSignal({
                            type: "stopInstancesDrag",
                          });
                        }}
                        data-tabled-id={svgId}
                        data-tabled-aspect={svgMedia.aspect}
                        data-tabled-content-type="svg"
                        options={{ dragPreventDefault: true }}
                      />
                    ) : null,
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
