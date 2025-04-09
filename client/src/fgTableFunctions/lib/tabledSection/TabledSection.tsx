import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { useSignalContext } from "../../../context/signalContext/SignalContext";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgPortal from "../../../elements/fgPortal/FgPortal";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LazyScrollingContainer from "../../../elements/lazyScrollingContainer/LazyScrollingContainer";
import FgInput from "../../../elements/fgInput/FgInput";
import { StaticContentTypes } from "../../../../../universal/contentTypeConstant";
import FgImageElement from "../../../elements/fgImageElement/FgImageElement";
import AdvancedSection from "./lib/tools/advancedSection/AdvancedSection";
import Tools from "./lib/tools/Tools";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const tableTopReducedLineIcon =
  nginxAssetServerBaseUrl + "svgs/tableTopReducedLineIcon.svg";
const tableTopReducedTippedLineIcon =
  nginxAssetServerBaseUrl + "svgs/tableTopReducedTippedLineIcon.svg";
const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";

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
  const [advanced, setAdvanced] = useState(false);
  const staticPlacement = useRef<{
    x: "default" | "hide" | number;
    y: "default" | "hide" | number;
    scale: "hide" | number;
    alignVertical: "none" | "top" | "center" | "bottom";
    alignHorizontal: "none" | "right" | "center" | "left";
  }>({
    x: "default",
    y: "default",
    scale: 1,
    alignVertical: "none",
    alignHorizontal: "none",
  });
  const selected = useRef<
    {
      contentType: StaticContentTypes;
      contentId: string;
      aspect: number;
      count: number | "zero";
    }[]
  >([]);
  const tabledSectionScrollingContainerRef = useRef<HTMLDivElement>(null);
  const tabledButtonRef = useRef<HTMLButtonElement>(null);
  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);
  const lastPressed = useRef<
    | {
        contentType: StaticContentTypes;
        contentId: string;
        aspect: number;
        count: number;
      }
    | undefined
  >(undefined);

  const [_, setRerender] = useState(false);

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
        <FgPortal
          type="staticTopDomain"
          top={0}
          left={0}
          zValue={499999998}
          externalRef={tabledSectionRef}
          className={`${dragging ? "!opacity-0 transition-opacity" : ""} h-full w-full`}
          content={
            <div className="flex h-full w-full flex-col items-center justify-center">
              <LazyScrollingContainer
                externalRef={tabledSectionScrollingContainerRef}
                className="grid small-vertical-scroll-bar w-full grow gap-1 overflow-y-auto py-2"
                items={[
                  ...Object.entries(userMedia.current.svg.all).map(
                    ([svgId, svgMedia]) =>
                      svgMedia.state.includes("tabled") ? (
                        <div className="flex h-max w-full min-w-12 max-w-24 flex-col items-center justify-center space-y-1">
                          <FgButton
                            key={svgId}
                            className={`${selected.current.some((item) => item.contentId === svgId) ? "border-fg-red" : "border-transparent"} flex aspect-square w-full items-center justify-center rounded border-3 hover:border-fg-red`}
                            contentFunction={() =>
                              svgMedia.blobURL ? (
                                <FgImageElement
                                  className="aspect-square h-full object-contain"
                                  src={svgMedia.blobURL}
                                  alt={svgMedia.filename}
                                />
                              ) : undefined
                            }
                            clickFunction={() => {
                              let newSelected: {
                                contentType: StaticContentTypes;
                                contentId: string;
                                aspect: number;
                                count: number | "zero";
                              }[];

                              const currentlyActive = selected.current.some(
                                (item) => item.contentId === svgId,
                              );

                              const newEntry: {
                                contentType: StaticContentTypes;
                                contentId: string;
                                aspect: number;
                                count: number;
                              } = {
                                contentType: "svg",
                                contentId: svgId,
                                aspect: svgMedia.aspect ?? 1,
                                count: 1,
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
                                    (btn) =>
                                      (btn as HTMLElement).dataset.tabledId,
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
                                          foundButton?.dataset.tabledAspect ??
                                            "1",
                                        );
                                        const contentType =
                                          foundButton?.dataset
                                            .tabledContentType;

                                        if (!contentType || isNaN(aspect))
                                          return null;

                                        return {
                                          contentType,
                                          contentId: id!,
                                          aspect,
                                          count: 1,
                                        };
                                      })
                                      .filter(
                                        (
                                          item,
                                        ): item is {
                                          contentType: StaticContentTypes;
                                          contentId: string;
                                          aspect: number;
                                          count: number;
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
                                  newSelected = currentlyActive
                                    ? []
                                    : [newEntry];
                                }
                              } else {
                                lastPressed.current = currentlyActive
                                  ? undefined
                                  : {
                                      contentType: "svg",
                                      contentId: svgId,
                                      aspect: svgMedia.aspect ?? 1,
                                      count: 1,
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
                                        count: 1,
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
                                count: 1,
                              };

                              const newSelected: {
                                contentType: StaticContentTypes;
                                contentId: string;
                                aspect: number;
                                count: number | "zero";
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
                                      count: 1,
                                    },
                                  ];

                              selected.current = newSelected;
                              setRerender((prev) => !prev);

                              sendSignal({
                                type: "startInstancesDrag",
                                data: {
                                  instances: newSelected
                                    .filter(
                                      (sel) =>
                                        sel.count !== "zero" && sel.count !== 0,
                                    )
                                    .map((sel) => ({
                                      contentType: sel.contentType,
                                      contentId: sel.contentId,
                                      instances: Array.from({
                                        // @ts-expect-error "zero" was already filtered out
                                        length: sel.count,
                                      }).map(() => ({
                                        height: 15,
                                        width: 15 * sel.aspect,
                                      })),
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
                          {selected.current.some(
                            (item) => item.contentId === svgId,
                          ) && (
                            <div className="flex h-max w-full items-center justify-center">
                              <FgButton
                                className="aspect-square w-1/3"
                                contentFunction={() => (
                                  <FgSVGElement
                                    src={additionIcon}
                                    className="h-full w-full fill-fg-tone-black-1 stroke-fg-tone-black-1"
                                    attributes={[
                                      { key: "width", value: "100%" },
                                      { key: "height", value: "100%" },
                                    ]}
                                  />
                                )}
                                clickFunction={() => {
                                  const sel = selected.current.find(
                                    (item) => item.contentId === svgId,
                                  );
                                  if (sel)
                                    sel.count =
                                      sel.count === "zero"
                                        ? 1
                                        : Math.min(20, sel.count + 1);
                                  setRerender((prev) => !prev);
                                }}
                                hoverContent={
                                  <FgHoverContentStandard content="Increase new content" />
                                }
                                options={{
                                  hoverSpacing: 4,
                                  hoverType: "above",
                                  hoverZValue: 1000000,
                                  hoverTimeoutDuration: 3250,
                                }}
                              />
                              <FgInput
                                className="aspect-square w-1/3 font-K2D text-xl"
                                onChange={(event) => {
                                  let newCount: number | "zero" = parseInt(
                                    event.target.value,
                                  );

                                  if (isNaN(newCount)) {
                                    newCount = "zero";
                                  } else {
                                    newCount = Math.max(
                                      0,
                                      Math.min(20, newCount),
                                    );
                                  }

                                  const sel = selected.current.find(
                                    (item) => item.contentId === svgId,
                                  );
                                  if (sel) sel.count = newCount;
                                  setRerender((prev) => !prev);
                                }}
                                onUnfocus={() => {
                                  const sel = selected.current.find(
                                    (item) => item.contentId === svgId,
                                  );
                                  if (sel && sel.count === "zero") {
                                    sel.count = 0;
                                    setRerender((prev) => !prev);
                                  }
                                }}
                                externalValue={
                                  selected.current.find(
                                    (item) => item.contentId === svgId,
                                  )?.count !== "zero"
                                    ? `${
                                        selected.current.find(
                                          (item) => item.contentId === svgId,
                                        )?.count ?? ""
                                      }`
                                    : ""
                                }
                                options={{
                                  submitButton: false,
                                  padding: 0,
                                  centerText: true,
                                }}
                              />
                              <FgButton
                                className="aspect-square w-1/3"
                                contentFunction={() => (
                                  <FgSVGElement
                                    src={minusIcon}
                                    className="h-full w-full fill-fg-tone-black-1 stroke-fg-tone-black-1"
                                    attributes={[
                                      { key: "width", value: "100%" },
                                      { key: "height", value: "100%" },
                                    ]}
                                  />
                                )}
                                clickFunction={() => {
                                  const sel = selected.current.find(
                                    (item) => item.contentId === svgId,
                                  );
                                  if (sel)
                                    sel.count =
                                      sel.count === "zero"
                                        ? 0
                                        : Math.max(0, sel.count - 1);
                                  setRerender((prev) => !prev);
                                }}
                                hoverContent={
                                  <FgHoverContentStandard content="Decrease new content" />
                                }
                                options={{
                                  hoverSpacing: 4,
                                  hoverType: "above",
                                  hoverZValue: 1000000,
                                  hoverTimeoutDuration: 3250,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ) : null,
                  ),
                ]}
              />
              <div
                className={`${advanced ? "h-max" : "h-8"} flex w-full flex-col items-start justify-center`}
              >
                <Tools
                  selected={selected}
                  setRerender={setRerender}
                  setAdvanced={setAdvanced}
                />
                {advanced && (
                  <AdvancedSection staticPlacement={staticPlacement} />
                )}
              </div>
            </div>
          }
          options={{ animate: false }}
        />
      )}
    </>
  );
}
