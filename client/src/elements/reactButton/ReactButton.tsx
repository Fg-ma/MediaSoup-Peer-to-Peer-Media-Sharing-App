import React, { useEffect, useRef, useState } from "react";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import FgImageElement from "../fgImageElement/FgImageElement";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import FgPanel from "../fgPanel/FgPanel";
import LazyScrollingContainer from "../lazyScrollingContainer/LazyScrollingContainer";
import { reactionsMeta } from "./lib/typeConstant";
import { TableReactions } from "../../../../universal/typeConstant";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const reactionsIcon =
  nginxAssetSeverBaseUrl + "svgs/reactions/reactionsIcon.svg";
const reactionsOffIcon =
  nginxAssetSeverBaseUrl + "svgs/reactions/reactionsOffIcon.svg";

export default function ReactButton({
  reactionsPanelActive,
  setReactionsPanelActive,
  clickFunction,
  reactionFunction,
}: {
  reactionsPanelActive: boolean;
  setReactionsPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  clickFunction: () => void;
  reactionFunction: (reaction: TableReactions) => void;
}) {
  const [cols, setCols] = useState(3);
  const reactionsButtonRef = useRef<HTMLButtonElement>(null);
  const reactionsPanelScrollingContainerRef = useRef<HTMLDivElement>(null);
  const reactionsPanelRef = useRef<HTMLDivElement>(null);

  const gridColumnsChange = () => {
    if (!reactionsPanelScrollingContainerRef.current) return;

    const width = reactionsPanelScrollingContainerRef.current.clientWidth;
    if (width < 100) {
      if (cols !== 3) setCols(3);
    } else if (width < 300) {
      if (cols !== 4) setCols(4);
    } else if (width < 400) {
      if (cols !== 5) setCols(5);
    } else if (width < 500) {
      if (cols !== 6) setCols(6);
    } else if (width < 600) {
      if (cols !== 7) setCols(7);
    } else if (width < 700) {
      if (cols !== 8) setCols(8);
    } else if (width >= 800) {
      if (cols !== 9) setCols(9);
    }
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (
      !reactionsButtonRef.current?.contains(event.target as Node) &&
      !reactionsPanelRef.current?.contains(event.target as Node)
    ) {
      setReactionsPanelActive(false);
    }
  };

  useEffect(() => {
    if (reactionsPanelActive) {
      document.addEventListener("pointerdown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [reactionsPanelActive]);

  return (
    <>
      <FgButton
        externalRef={reactionsButtonRef}
        className='flex items-center justify-end h-full !aspect-square pointer-events-auto'
        clickFunction={clickFunction}
        contentFunction={() => {
          const src = reactionsPanelActive ? reactionsOffIcon : reactionsIcon;

          return (
            <FgSVG
              src={src}
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
                { key: "fill", value: "#f2f2f2" },
              ]}
            />
          );
        }}
        hoverContent={
          <FgHoverContentStandard
            content={
              reactionsPanelActive
                ? "Close reactions (Q)"
                : "Open reactions (Q)"
            }
          />
        }
        options={{ hoverType: "below" }}
      />
      {reactionsPanelActive && (
        <FgPanel
          externalRef={reactionsPanelRef}
          content={
            <LazyScrollingContainer
              externalRef={reactionsPanelScrollingContainerRef}
              className={`small-vertical-scroll-bar grid gap-1 min-w-[9.5rem] min-h-[9.5rem] h-full w-full overflow-y-auto py-2 ${
                cols === 3
                  ? "grid-cols-3"
                  : cols === 4
                  ? "grid-cols-4"
                  : cols === 5
                  ? "grid-cols-5"
                  : cols === 6
                  ? "grid-cols-6"
                  : cols === 7
                  ? "grid-cols-7"
                  : cols === 8
                  ? "grid-cols-8"
                  : cols === 9
                  ? "grid-cols-9"
                  : "grid-cols-10"
              }`}
              items={[
                ...Object.entries(reactionsMeta).map(([reaction, meta]) => (
                  <FgButton
                    key={reaction}
                    scrollingContainerRef={reactionsPanelScrollingContainerRef}
                    className='flex border-gray-300 items-center justify-center min-w-12 w-full aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 bg-black bg-opacity-75'
                    clickFunction={() =>
                      reactionFunction(reaction as TableReactions)
                    }
                    contentFunction={() =>
                      meta.type === "svg" ? (
                        <FgSVG
                          src={meta.src}
                          className='flex items-center justify-center'
                          attributes={[
                            { key: "width", value: "90%" },
                            { key: "height", value: "90%" },
                            { key: "fill", value: "#f2f2f2" },
                            { key: "stroke", value: "#f2f2f2" },
                          ]}
                        />
                      ) : (
                        <FgImageElement
                          src={meta.src}
                          srcLoading={meta.srcLoading}
                          style={{ width: "90%", height: "90%" }}
                        />
                      )
                    }
                    hoverContent={
                      <FgHoverContentStandard content={meta.name} />
                    }
                    options={{ hoverTimeoutDuration: 350 }}
                  />
                )),
              ]}
            />
          }
          initPosition={{
            referenceElement: reactionsButtonRef.current ?? undefined,
            placement: "above",
            padding: 4,
          }}
          initWidth={"278px"}
          initHeight={"268px"}
          minWidth={204}
          minHeight={190}
          resizeCallback={gridColumnsChange}
          closeCallback={clickFunction}
          closeLabelElement={
            <FgHoverContentStandard content='Close (x)' style='dark' />
          }
          closePosition='topRight'
          shadow={{ top: true, bottom: true }}
          backgroundColor={"#161616"}
          secondaryBackgroundColor={"#212121"}
        />
      )}
    </>
  );
}
