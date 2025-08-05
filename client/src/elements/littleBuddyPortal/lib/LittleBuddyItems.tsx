import React, { useRef, useState } from "react";
import { useSignalContext } from "../../../context/signalContext/SignalContext";
import FgButton from "../../fgButton/FgButton";
import FgImageElement from "../../fgImageElement/FgImageElement";
import FgSVGElement from "../../fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../fgHoverContentStandard/FgHoverContentStandard";
import FgInput from "../../fgInput/FgInput";
import {
  LittleBuddiesTypes,
  spirteSheetsMeta,
} from "../../../tableBabylon/littleBuddies/lib/typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";

export type MediaListenerTypes =
  | { type: "downloadComplete" }
  | { type: "downloadPaused" }
  | { type: "downloadResumed" }
  | { type: "downloadFailed" }
  | { type: string };

export default function LittleBuddyItems({
  littleBuddy,
  selected,
  littleBuddySectionScrollingContainerRef,
  lastPressed,
  setDragging,
  holdTimeout,
  holdInterval,
  setExternalRerender,
}: {
  littleBuddy: LittleBuddiesTypes;
  selected: React.MutableRefObject<
    {
      littleBuddy: LittleBuddiesTypes;
      aspect: number;
      count: number | "zero";
    }[]
  >;
  littleBuddySectionScrollingContainerRef: React.RefObject<HTMLDivElement>;
  lastPressed: React.MutableRefObject<
    | {
        littleBuddy: LittleBuddiesTypes;
        aspect: number;
        count: number;
      }
    | undefined
  >;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
  holdTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>;
  holdInterval: React.MutableRefObject<NodeJS.Timeout | undefined>;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { sendNewInstanceSignal } = useSignalContext();

  const littleBuddyMeta = spirteSheetsMeta[littleBuddy];

  const [_, setRerender] = useState(false);
  const aspectRatio = useRef(
    littleBuddyMeta.frameWidth / littleBuddyMeta.frameHeight,
  );
  const perserveSelected = useRef(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`${selected.current.some((item) => item.littleBuddy === littleBuddy) ? "h-max" : "aspect-square"} flex w-24 flex-col items-center justify-center space-y-1`}
    >
      <FgButton
        className="flex h-24 w-24 items-center justify-center"
        contentFunction={() => (
          <FgImageElement
            className={`${selected.current.some((item) => item.littleBuddy === littleBuddy) ? "border-fg-red" : "border-transparent"} ${aspectRatio.current > 1 ? "w-full" : "h-full"} overflow-hidden rounded border-3 object-contain hover:border-fg-red`}
            imageClassName={`${aspectRatio.current > 1 ? "!w-full !h-auto" : "!h-full !w-auto"} object-contain`}
            src={littleBuddyMeta.iconUrl}
            alt={littleBuddyMeta.title}
          />
        )}
        clickFunction={(event) => {
          if (perserveSelected.current) {
            perserveSelected.current = false;
            return;
          }

          let newSelected: {
            littleBuddy: LittleBuddiesTypes;
            aspect: number;
            count: number | "zero";
          }[];

          const currentlyActive = selected.current.some(
            (item) => item.littleBuddy === littleBuddy,
          );

          const newEntry: {
            littleBuddy: LittleBuddiesTypes;
            aspect: number;
            count: number;
          } = {
            littleBuddy,
            aspect: aspectRatio.current,
            count: 1,
          };

          if (event.shiftKey) {
            if (
              lastPressed.current &&
              lastPressed.current.littleBuddy !== littleBuddy
            ) {
              const buttons =
                littleBuddySectionScrollingContainerRef.current?.querySelectorAll(
                  "button[data-little-buddy]",
                ) || [];

              const buttonIds = Array.from(buttons).map(
                (btn) => (btn as HTMLElement).dataset.littleBuddy,
              );
              const startIdx = buttonIds.indexOf(
                lastPressed.current.littleBuddy,
              );
              const endIdx = buttonIds.indexOf(littleBuddy);

              if (startIdx !== -1 && endIdx !== -1) {
                const [from, to] = [startIdx, endIdx].sort((a, b) => a - b);
                const idsInRange = buttonIds.slice(from, to + 1);

                newSelected = idsInRange
                  .map((id) => {
                    const foundButton =
                      littleBuddySectionScrollingContainerRef.current?.querySelector(
                        `button[data-little-buddy="${id}"]`,
                      ) as HTMLButtonElement;

                    if (!foundButton) return null;

                    const littleBuddy = foundButton?.dataset.littleBuddy;
                    const aspect = parseFloat(
                      foundButton.dataset.littleBuddyAspect ?? "1",
                    );

                    if (!littleBuddy || isNaN(aspect)) return null;

                    return {
                      littleBuddy,
                      aspect,
                      count: 1,
                    };
                  })
                  .filter(
                    (
                      item,
                    ): item is {
                      littleBuddy: LittleBuddiesTypes;
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
                  littleBuddy,
                  aspect: aspectRatio.current ?? 1,
                  count: 1,
                };

            newSelected = currentlyActive
              ? selected.current.filter(
                  (item) => item.littleBuddy !== littleBuddy,
                )
              : (newSelected = [
                  ...selected.current,
                  {
                    littleBuddy,
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
            littleBuddy,
            aspect: aspectRatio.current ?? 1,
            count: 1,
          };

          const newSelected: {
            littleBuddy: LittleBuddiesTypes;
            aspect: number;
            count: number | "zero";
          }[] = selected.current.some(
            (item) => item.littleBuddy === littleBuddy,
          )
            ? selected.current
            : [
                ...selected.current,
                {
                  littleBuddy,
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
                  littleBuddy: sel.littleBuddy,
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
          <FgHoverContentStandard
            content={littleBuddyMeta.title}
            style="light"
          />
        }
        data-little-buddy={littleBuddy}
        data-little-buddy-aspect={aspectRatio.current}
        options={{
          dragPreventDefault: true,
          hoverSpacing: 4,
          hoverType: "above",
          hoverTimeoutDuration: 1250,
        }}
      />
      {selected.current.some((item) => item.littleBuddy === littleBuddy) && (
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
                    (item) => item.littleBuddy === littleBuddy,
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
                (item) => item.littleBuddy === littleBuddy,
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
                (item) => item.littleBuddy === littleBuddy,
              );
              if (sel) sel.count = newCount;
              setRerender((prev) => !prev);
            }}
            onUnfocus={() => {
              const sel = selected.current.find(
                (item) => item.littleBuddy === littleBuddy,
              );
              if (sel && sel.count === "zero") {
                sel.count = 0;
                setRerender((prev) => !prev);
              }
            }}
            externalValue={
              selected.current.find((item) => item.littleBuddy === littleBuddy)
                ?.count !== "zero"
                ? `${
                    selected.current.find(
                      (item) => item.littleBuddy === littleBuddy,
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
                    (item) => item.littleBuddy === littleBuddy,
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
                (item) => item.littleBuddy === littleBuddy,
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
