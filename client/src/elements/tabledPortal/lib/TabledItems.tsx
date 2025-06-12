import React, { useEffect, useRef, useState } from "react";
import { useSignalContext } from "../../../context/signalContext/SignalContext";
import FgButton from "../../fgButton/FgButton";
import FgImageElement from "../../fgImageElement/FgImageElement";
import { StaticContentTypes } from "../../../../../universal/contentTypeConstant";
import FgSVGElement from "../../fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../fgHoverContentStandard/FgHoverContentStandard";
import FgInput from "../../fgInput/FgInput";
import TableTextMedia from "../../../media/fgTableText/TableTextMedia";
import TableSoundClipMedia from "../../../media/fgTableSoundClip/TableSoundClipMedia";
import TableApplicationMedia from "../../../media/fgTableApplication/TableApplicationMedia";
import TableVideoMedia from "../../../media/fgTableVideo/TableVideoMedia";
import TableImageMedia from "../../../media/fgTableImage/TableImageMedia";
import TableSvgMedia from "../../../media/fgTableSvg/TableSvgMedia";
import LoadingElement from "../../loadingElement/LoadingElement";
import DownloadFailed from "../../downloadFailed/DownloadFailed";
import DownloadPaused from "../../downloadPaused/DownloadPaused";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";
const textIcon = nginxAssetServerBaseUrl + "svgs/textIcon.svg";

export type MediaListenerTypes =
  | { type: "downloadComplete" }
  | { type: "downloadPaused" }
  | { type: "downloadResumed" }
  | { type: "downloadFailed" }
  | { type: string };

export default function TabledItems({
  media,
  contentType,
  contentId,
  selected,
  filename,
  tabledSectionScrollingContainerRef,
  lastPressed,
  setDragging,
  holdTimeout,
  holdInterval,
  addDownloadListener,
  removeDownloadListener,
  setExternalRerender,
}: {
  media:
    | TableTextMedia
    | TableSvgMedia
    | TableImageMedia
    | TableVideoMedia
    | TableApplicationMedia
    | TableSoundClipMedia;
  contentType: StaticContentTypes;
  contentId: string;
  selected: React.MutableRefObject<
    {
      contentType: StaticContentTypes;
      contentId: string;
      aspect: number;
      count: number | "zero";
    }[]
  >;
  filename: string;
  tabledSectionScrollingContainerRef: React.RefObject<HTMLDivElement>;
  lastPressed: React.MutableRefObject<
    | {
        contentType: StaticContentTypes;
        contentId: string;
        aspect: number;
        count: number;
      }
    | undefined
  >;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
  holdTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>;
  holdInterval: React.MutableRefObject<NodeJS.Timeout | undefined>;
  addDownloadListener?: (
    listener: (message: MediaListenerTypes) => void,
  ) => void;
  removeDownloadListener?: (
    listener: (message: MediaListenerTypes) => void,
  ) => void;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { sendNewInstanceSignal } = useSignalContext();

  const [_, setRerender] = useState(false);
  const aspectRatio = useRef(
    media instanceof TableSoundClipMedia || media instanceof TableTextMedia
      ? 1
      : (media.aspect ?? 1),
  );
  const perserveSelected = useRef(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadMessage = (msg: MediaListenerTypes) => {
    switch (msg.type) {
      case "downloadComplete":
        setTimeout(() => {
          aspectRatio.current =
            media instanceof TableSoundClipMedia ||
            media instanceof TableTextMedia
              ? 1
              : (media.aspect ?? 1);

          if (
            selected.current.some(
              (sel) =>
                sel.contentId === contentId && sel.contentType === contentType,
            )
          ) {
            const idx = selected.current.findIndex(
              (sel) =>
                sel.contentId === contentId && sel.contentType === contentType,
            );
            selected.current[idx].aspect =
              media instanceof TableSoundClipMedia ||
              media instanceof TableTextMedia
                ? 1
                : (media.aspect ?? 1);
          }

          setRerender((prev) => !prev);
        }, 0);
        break;
      case "downloadPaused":
        setTimeout(() => {
          setRerender((prev) => !prev);
        }, 0);
        break;
      case "downloadResumed":
        setTimeout(() => {
          setRerender((prev) => !prev);
        }, 0);
        break;
      case "downloadFailed":
        setTimeout(() => {
          setRerender((prev) => !prev);
        }, 0);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (
      media.loadingState === "downloaded" ||
      !addDownloadListener ||
      !removeDownloadListener
    )
      return;

    addDownloadListener(handleDownloadMessage);

    return () => {
      removeDownloadListener(handleDownloadMessage);
    };
  }, []);

  useEffect(() => {
    if (
      !(media instanceof TableVideoMedia) ||
      media.loadingState !== "downloaded" ||
      !videoContainerRef.current
    )
      return;

    const thumbnailClone = media.thumbnail.cloneNode(true) as HTMLImageElement;
    const container = videoContainerRef.current;
    thumbnailClone.style.objectFit = "contain";
    if (aspectRatio.current > 1) {
      thumbnailClone.style.height = "auto";
      thumbnailClone.style.width = "100%";
    } else {
      thumbnailClone.style.height = "100%";
      thumbnailClone.style.width = "auto";
    }
    container?.appendChild(thumbnailClone);

    return () => {
      if (thumbnailClone && container.contains(thumbnailClone)) {
        container.removeChild(thumbnailClone);
      }
    };
  }, []);

  return (
    <div
      className={`${selected.current.some((item) => item.contentId === contentId) ? "h-max" : "aspect-square"} flex w-24 flex-col items-center justify-center space-y-1`}
    >
      <FgButton
        className="flex h-24 w-24 items-center justify-center"
        contentFunction={() =>
          media.loadingState === "downloaded" ? (
            media instanceof TableTextMedia ? (
              <div
                className={`${selected.current.some((item) => item.contentId === contentId) ? "border-fg-red" : "border-transparent"} flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded border-3 hover:border-fg-red`}
              >
                <div className="h-8 w-full truncate font-K2D text-xl text-fg-white">
                  {filename}
                </div>
                <FgSVGElement
                  className="mt-2 aspect-square fill-fg-white"
                  style={{ height: "calc(100% - 2.5rem)" }}
                  src={textIcon}
                  attributes={[
                    { key: "width", value: "100%" },
                    { key: "height", value: "100%" },
                  ]}
                />
              </div>
            ) : media instanceof TableImageMedia ||
              media instanceof TableSvgMedia ? (
              media.blobURL ? (
                <FgImageElement
                  className={`${selected.current.some((item) => item.contentId === contentId) ? "border-fg-red" : "border-transparent"} ${aspectRatio.current > 1 ? "w-full" : "h-full"} overflow-hidden rounded border-3 object-contain hover:border-fg-red`}
                  imageClassName={`${aspectRatio.current > 1 ? "!w-full !h-auto" : "!h-full !w-auto"} object-contain`}
                  src={media.blobURL}
                  alt={filename}
                />
              ) : undefined
            ) : media instanceof TableVideoMedia ? (
              <div
                ref={videoContainerRef}
                className={`${selected.current.some((item) => item.contentId === contentId) ? "border-fg-red" : "border-transparent"} ${aspectRatio.current > 1 ? "w-full" : "h-full"} overflow-hidden rounded border-3 object-contain hover:border-fg-red`}
              ></div>
            ) : undefined
          ) : media.loadingState === "downloading" ? (
            <LoadingElement
              className={`${selected.current.some((item) => item.contentId === contentId) ? "border-3 border-fg-red" : "border-0 hover:border-3"} h-full w-full overflow-hidden rounded hover:border-fg-red`}
            />
          ) : media.loadingState === "failed" ? (
            <DownloadFailed
              className={`${selected.current.some((item) => item.contentId === contentId) ? "border-3 border-fg-red" : "border-0 hover:border-3"} h-full w-full overflow-hidden rounded border-3 hover:border-fg-red`}
            />
          ) : media.loadingState === "paused" ? (
            <DownloadPaused
              className={`${selected.current.some((item) => item.contentId === contentId) ? "border-3 border-fg-red" : "border-0 hover:border-3"} h-full w-full overflow-hidden rounded border-3 hover:border-fg-red`}
            />
          ) : undefined
        }
        clickFunction={(event) => {
          if (perserveSelected.current) {
            perserveSelected.current = false;
            return;
          }

          let newSelected: {
            contentType: StaticContentTypes;
            contentId: string;
            aspect: number;
            count: number | "zero";
          }[];

          const currentlyActive = selected.current.some(
            (item) => item.contentId === contentId,
          );

          const newEntry: {
            contentType: StaticContentTypes;
            contentId: string;
            aspect: number;
            count: number;
          } = {
            contentType,
            contentId,
            aspect: aspectRatio.current,
            count: 1,
          };

          if (event.shiftKey) {
            if (
              lastPressed.current &&
              lastPressed.current.contentId !== contentId
            ) {
              const buttons =
                tabledSectionScrollingContainerRef.current?.querySelectorAll(
                  "button[data-tabled-id]",
                ) || [];

              const buttonIds = Array.from(buttons).map(
                (btn) => (btn as HTMLElement).dataset.tabledId,
              );
              const startIdx = buttonIds.indexOf(lastPressed.current.contentId);
              const endIdx = buttonIds.indexOf(contentId);

              if (startIdx !== -1 && endIdx !== -1) {
                const [from, to] = [startIdx, endIdx].sort((a, b) => a - b);
                const idsInRange = buttonIds.slice(from, to + 1);

                newSelected = idsInRange
                  .map((id) => {
                    const foundButton =
                      tabledSectionScrollingContainerRef.current?.querySelector(
                        `button[data-tabled-id="${id}"]`,
                      ) as HTMLButtonElement;

                    if (!foundButton) return null;

                    const aspect = parseFloat(
                      foundButton.dataset.tabledAspect ?? "1",
                    );
                    const contentType = foundButton?.dataset.tabledContentType;

                    if (!contentType || isNaN(aspect)) return null;

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
            } else {
              // Toggle single
              lastPressed.current = currentlyActive ? undefined : newEntry;
              newSelected = currentlyActive ? [] : [newEntry];
            }
          } else {
            lastPressed.current = currentlyActive
              ? undefined
              : {
                  contentType,
                  contentId,
                  aspect: aspectRatio.current ?? 1,
                  count: 1,
                };

            newSelected = currentlyActive
              ? selected.current.filter((item) => item.contentId !== contentId)
              : (newSelected = [
                  ...selected.current,
                  {
                    contentType,
                    contentId,
                    aspect: aspectRatio.current ?? 1,
                    count: 1,
                  },
                ]);
          }
          selected.current = newSelected;
          setRerender((prev) => !prev);
          setExternalRerender((prev) => !prev);
        }}
        startDragFunction={() => {
          setDragging(true);

          lastPressed.current = {
            contentType,
            contentId,
            aspect: aspectRatio.current ?? 1,
            count: 1,
          };

          const newSelected: {
            contentType: StaticContentTypes;
            contentId: string;
            aspect: number;
            count: number | "zero";
          }[] = selected.current.some((item) => item.contentId === contentId)
            ? selected.current
            : [
                ...selected.current,
                {
                  contentType,
                  contentId,
                  aspect: aspectRatio.current ?? 1,
                  count: 1,
                },
              ];

          selected.current = newSelected;
          setRerender((prev) => !prev);

          sendNewInstanceSignal({
            type: "instancesLayerMode",
            data: {
              mode: "standard",
            },
          });

          sendNewInstanceSignal({
            type: "startInstancesDrag",
            data: {
              instances: newSelected
                .filter((sel) => sel.count !== "zero" && sel.count !== 0)
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

          perserveSelected.current = true;

          sendNewInstanceSignal({
            type: "instancesLayerMode",
            data: {
              mode: "standard",
            },
          });

          sendNewInstanceSignal({
            type: "stopInstancesDrag",
          });
        }}
        hoverContent={
          <FgHoverContentStandard content={filename} style="light" />
        }
        data-tabled-id={contentId}
        data-tabled-content-type={contentType}
        data-tabled-aspect={aspectRatio.current}
        options={{
          dragPreventDefault: true,
          hoverSpacing: 4,
          hoverType: "above",
          hoverTimeoutDuration: 1250,
        }}
      />
      {selected.current.some((item) => item.contentId === contentId) && (
        <div className="flex h-max w-full items-center justify-center">
          <FgButton
            className="flex aspect-square w-1/3 items-center justify-center"
            contentFunction={() => (
              <FgSVGElement
                src={additionIcon}
                className="aspect-square h-[70%] fill-fg-white stroke-fg-white"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
            )}
            pointerDownFunction={() => {
              if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
                holdTimeout.current = undefined;
              }
              if (holdInterval.current) {
                clearInterval(holdInterval.current);
                holdInterval.current = undefined;
              }

              holdTimeout.current = setTimeout(() => {
                holdInterval.current = setInterval(() => {
                  const sel = selected.current.find(
                    (item) => item.contentId === contentId,
                  );
                  if (sel)
                    sel.count =
                      sel.count === "zero" ? 1 : Math.min(20, sel.count + 1);
                  setRerender((prev) => !prev);
                }, 50);
              }, 1000);
            }}
            pointerUpFunction={() => {
              if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
                holdTimeout.current = undefined;
              }
              if (holdInterval.current) {
                clearInterval(holdInterval.current);
                holdInterval.current = undefined;
              }
            }}
            clickFunction={() => {
              const sel = selected.current.find(
                (item) => item.contentId === contentId,
              );
              if (sel)
                sel.count =
                  sel.count === "zero" ? 1 : Math.min(20, sel.count + 1);
              setRerender((prev) => !prev);
            }}
            hoverContent={
              <FgHoverContentStandard content="Increase new content" />
            }
            options={{
              hoverSpacing: 4,
              hoverType: "above",
              hoverTimeoutDuration: 3250,
            }}
          />
          <FgInput
            className="aspect-square w-1/3 font-K2D text-xl text-fg-white"
            type="number"
            onChange={(event) => {
              let newCount: number | "zero" = parseInt(event.target.value);

              if (isNaN(newCount)) {
                newCount = "zero";
              } else {
                newCount = Math.max(0, Math.min(20, newCount));
              }

              const sel = selected.current.find(
                (item) => item.contentId === contentId,
              );
              if (sel) sel.count = newCount;
              setRerender((prev) => !prev);
            }}
            onUnfocus={() => {
              const sel = selected.current.find(
                (item) => item.contentId === contentId,
              );
              if (sel && sel.count === "zero") {
                sel.count = 0;
                setRerender((prev) => !prev);
              }
            }}
            externalValue={
              selected.current.find((item) => item.contentId === contentId)
                ?.count !== "zero"
                ? `${
                    selected.current.find(
                      (item) => item.contentId === contentId,
                    )?.count ?? ""
                  }`
                : ""
            }
            options={{
              submitButton: false,
              padding: 0,
              centerText: true,
              backgroundColor: "transparent",
              min: 0,
              max: 20,
              step: 1,
              autocomplete: "off",
            }}
          />
          <FgButton
            className="flex aspect-square w-1/3 items-center justify-center"
            contentFunction={() => (
              <FgSVGElement
                src={minusIcon}
                className="aspect-square h-[70%] fill-fg-white stroke-fg-white"
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
            )}
            pointerDownFunction={() => {
              if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
                holdTimeout.current = undefined;
              }
              if (holdInterval.current) {
                clearInterval(holdInterval.current);
                holdInterval.current = undefined;
              }

              holdTimeout.current = setTimeout(() => {
                holdInterval.current = setInterval(() => {
                  const sel = selected.current.find(
                    (item) => item.contentId === contentId,
                  );
                  if (sel)
                    sel.count =
                      sel.count === "zero" ? 0 : Math.max(0, sel.count - 1);
                  setRerender((prev) => !prev);
                }, 50);
              }, 1000);
            }}
            pointerUpFunction={() => {
              if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
                holdTimeout.current = undefined;
              }
              if (holdInterval.current) {
                clearInterval(holdInterval.current);
                holdInterval.current = undefined;
              }
            }}
            clickFunction={() => {
              const sel = selected.current.find(
                (item) => item.contentId === contentId,
              );
              if (sel)
                sel.count =
                  sel.count === "zero" ? 0 : Math.max(0, sel.count - 1);
              setRerender((prev) => !prev);
            }}
            hoverContent={
              <FgHoverContentStandard content="Decrease new content" />
            }
            options={{
              hoverSpacing: 4,
              hoverType: "above",
              hoverTimeoutDuration: 3250,
            }}
          />
        </div>
      )}
    </div>
  );
}
