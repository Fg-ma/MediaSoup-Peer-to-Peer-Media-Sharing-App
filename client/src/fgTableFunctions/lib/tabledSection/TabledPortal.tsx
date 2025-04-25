import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import { useSignalContext } from "../../../context/signalContext/SignalContext";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import { StaticContentTypes } from "../../../../../universal/contentTypeConstant";
import FgPortal from "../../../elements/fgPortal/FgPortal";
import LazyScrollingContainer from "../../../elements/lazyScrollingContainer/LazyScrollingContainer";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgInput from "../../../elements/fgInput/FgInput";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgImageElement from "../../../elements/fgImageElement/FgImageElement";
import ScrollingContainer from "../../../elements/scrollingContainer/ScrollingContainer";
import ScrollingContainerButton from "../../../elements/scrollingContainer/lib/ScrollingContainerButton";
import Tools from "./lib/tools/Tools";
import AdvancedSection from "./lib/tools/advancedSection/AdvancedSection";
import TabledPortalController from "./lib/TabledPortalController";
import SearchBar from "./lib/tools/searchBar/SearchBar";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";

export type Categories = StaticContentTypes | "all";

const CategoryTitles: { [category in Categories]: string } = {
  all: "All",
  image: "Images",
  video: "Videos",
  soundClip: "Sound clips",
  svg: "Vectors",
  application: "Applications",
  text: "Text",
};

export type InstanceType = {
  contentType: StaticContentTypes;
  contentId: string;
  instances: {
    width: number;
    height: number;
    x: number;
    y: number;
  }[];
};

export default function TabledPortal({
  dragging,
  setDragging,
  setTabledActive,
}: {
  dragging: boolean;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setTabledActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userMedia } = useMediaContext();
  const { sendSignal } = useSignalContext();
  const { tableStaticContentSocket } = useSocketContext();

  const [advanced, setAdvanced] = useState(false);
  const staticPlacement = useRef<{
    x: "default" | "hide" | number;
    y: "default" | "hide" | number;
    scale: "hide" | number;
  }>({
    x: "default",
    y: "default",
    scale: 1,
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
  const lastPressed = useRef<
    | {
        contentType: StaticContentTypes;
        contentId: string;
        aspect: number;
        count: number;
      }
    | undefined
  >(undefined);
  const indicators = useRef<InstanceType[]>([]);
  const [activePage, setActivePage] = useState<Categories>("all");
  const [searchContent, setSearchContent] = useState<
    {
      score: number;
      aid?: string;
      iid?: string;
      sid?: string;
      xid?: string;
      vid?: string;
    }[]
  >([]);
  const tabledPortalRef = useRef<HTMLDivElement>(null);
  const tabledContentRef = useRef<HTMLDivElement>(null);
  const searchValue = useRef("");
  const holdTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const holdInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  const [_, setRerender] = useState(false);

  const tabledPortalController = new TabledPortalController(
    indicators,
    staticPlacement,
    selected,
    setRerender,
    tableStaticContentSocket,
    tabledPortalRef,
    tabledContentRef,
    setTabledActive,
  );

  return (
    <FgPortal
      externalPortalRef={tabledPortalRef}
      type="staticTopDomain"
      top={0}
      left={0}
      zValue={500000000}
      className={`${dragging ? "!opacity-0 transition-opacity" : ""} flex h-full w-full items-center justify-center bg-fg-tone-black-1 bg-opacity-55`}
      content={
        <div
          ref={tabledContentRef}
          className={`${advanced ? "flex-row-reverse" : "flex-col"} flex h-[80%] w-[80%] items-center justify-center overflow-hidden rounded-md border-2 border-fg-off-white bg-fg-tone-black-6`}
          onPointerDown={tabledPortalController.handlePortalClick}
        >
          <div
            className={`${advanced ? "h-full" : ""} flex grow flex-col`}
            style={{
              width: advanced ? "calc(100% - 14.5rem)" : "100%",
            }}
          >
            <ScrollingContainer
              content={
                <div
                  className={`${advanced ? "!h-20 py-2" : "!h-16"} flex items-center justify-start space-x-3 px-4`}
                >
                  {Object.entries(CategoryTitles).map(([key, title]) => {
                    return (
                      <ScrollingContainerButton
                        key={key}
                        externalValue={key === activePage}
                        content={title}
                        callbackFunction={() => {
                          setActivePage(key as Categories);
                        }}
                        backgroundColor="#696969"
                      />
                    );
                  })}
                </div>
              }
              buttonBackgroundColor={"#3e3e3e"}
            />
            <LazyScrollingContainer
              externalRef={tabledSectionScrollingContainerRef}
              className={`${advanced ? "h-full" : "w-full"} small-vertical-scroll-bar grid grow gap-1 overflow-y-auto p-2`}
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(3rem, 6rem))",
                gridAutoRows: "max-content",
              }}
              items={[
                ...(activePage === "all" || activePage === "svg"
                  ? Object.entries(userMedia.current.svg.all).map(
                      ([svgId, svgMedia]) =>
                        (searchContent.length === 0 &&
                          svgMedia.state.includes("tabled")) ||
                        (searchContent.length !== 0 &&
                          searchContent.some((item) => item.sid === svgId)) ? (
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
                              clickFunction={(event) => {
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

                                if (event.shiftKey) {
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
                                      const [from, to] = [
                                        startIdx,
                                        endIdx,
                                      ].sort((a, b) => a - b);
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
                                          sel.count !== "zero" &&
                                          sel.count !== 0,
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
                                          (item) => item.contentId === svgId,
                                        );
                                        if (sel)
                                          sel.count =
                                            sel.count === "zero"
                                              ? 1
                                              : Math.min(20, sel.count + 1);
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
                                  className="aspect-square w-1/3 font-K2D text-xl text-fg-white"
                                  type="number"
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
                                          (item) => item.contentId === svgId,
                                        );
                                        if (sel)
                                          sel.count =
                                            sel.count === "zero"
                                              ? 0
                                              : Math.max(0, sel.count - 1);
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
                    )
                  : []),
              ]}
            />
            {advanced && (
              <SearchBar
                activePage={activePage}
                setSearchContent={setSearchContent}
                advanced={advanced}
                searchValue={searchValue}
              />
            )}
          </div>
          <div
            className={`${advanced ? "my-2 ml-2" : "mx-2 mb-2"} flex flex-col items-start justify-center space-y-2 rounded-md border-2 border-fg-white bg-fg-off-white p-3`}
            style={{
              width: advanced ? "14rem" : "calc(100% - 1rem)",
              height: advanced ? "calc(100% - 1rem)" : "max-content",
            }}
          >
            {advanced && (
              <AdvancedSection
                staticPlacement={staticPlacement}
                selected={selected}
                indicators={indicators}
                tabledPortalController={tabledPortalController}
              />
            )}
            <Tools
              tabledPortalController={tabledPortalController}
              advanced={advanced}
              setAdvanced={setAdvanced}
              setTabledActive={setTabledActive}
              activePage={activePage}
              setSearchContent={setSearchContent}
              searchValue={searchValue}
            />
          </div>
        </div>
      }
      options={{ animate: false }}
    />
  );
}
