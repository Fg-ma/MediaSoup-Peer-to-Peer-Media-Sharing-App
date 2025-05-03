import React, { useRef, useState } from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgImageElement from "../../../../elements/fgImageElement/FgImageElement";
import { StaticContentTypes } from "../../../../../../universal/contentTypeConstant";
import FgSVGElement from "../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgInput from "../../../../elements/fgInput/FgInput";
import { useSignalContext } from "../../../../context/signalContext/SignalContext";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";

export default function TabledItems({
  contentType,
  contentId,
  selected,
  blobURL,
  filename,
  aspect,
  tabledSectionScrollingContainerRef,
  lastPressed,
  setDragging,
  holdTimeout,
  holdInterval,
}: {
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
  blobURL: string | undefined;
  filename: string;
  aspect: number | undefined;
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
}) {
  const { sendNewInstanceSignal } = useSignalContext();

  const [_, setRerender] = useState(false);
  const perserveSelected = useRef(false);

  return (
    <div className="flex h-max w-full min-w-12 max-w-24 flex-col items-center justify-center space-y-1">
      <FgButton
        className={`${selected.current.some((item) => item.contentId === contentId) ? "border-fg-red" : "border-transparent"} flex aspect-square w-full items-center justify-center rounded border-3 hover:border-fg-red`}
        contentFunction={() =>
          blobURL ? (
            <FgImageElement
              className="aspect-square h-full object-contain"
              imageClassName="object-contain"
              src={blobURL}
              alt={filename}
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
            aspect: aspect ?? 1,
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
                      foundButton?.dataset.tabledAspect ?? "1",
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

              lastPressed.current = newEntry;
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
                  aspect: aspect ?? 1,
                  count: 1,
                };

            newSelected = currentlyActive
              ? selected.current.filter((item) => item.contentId !== contentId)
              : (newSelected = [
                  ...selected.current,
                  {
                    contentType,
                    contentId,
                    aspect: aspect ?? 1,
                    count: 1,
                  },
                ]);
          }

          selected.current = newSelected;
          setRerender((prev) => !prev);
        }}
        startDragFunction={() => {
          setDragging(true);

          lastPressed.current = {
            contentType,
            contentId,
            aspect: aspect ?? 1,
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
                  aspect: aspect ?? 1,
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
        data-tabled-id={contentId}
        data-tabled-content-type={contentType}
        data-tabled-aspect={aspect}
        options={{ dragPreventDefault: true }}
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
