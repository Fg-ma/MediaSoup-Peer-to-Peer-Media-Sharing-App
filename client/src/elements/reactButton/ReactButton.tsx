import React, { useEffect, useRef, useState } from "react";
import FgButton from "../fgButton/FgButton";
import FgSVGElement from "../fgSVGElement/FgSVGElement";
import FgImageElement from "../fgImageElement/FgImageElement";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import FgPanel from "../fgPanel/FgPanel";
import LazyScrollingContainer from "../lazyScrollingContainer/LazyScrollingContainer";
import {
  reactButtonDefaultOptions,
  ReactButtonOptions,
  reactionsMeta,
} from "./lib/typeConstant";
import { TableReactions } from "../../../../universal/reactionsTypeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const reactionsIcon =
  nginxAssetServerBaseUrl + "svgs/reactions/reactionsIcon.svg";
const reactionsOffIcon =
  nginxAssetServerBaseUrl + "svgs/reactions/reactionsOffIcon.svg";

export default function ReactButton({
  className,
  reactionsPanelActive,
  setReactionsPanelActive,
  clickFunction,
  reactionFunction,
  options,
}: {
  className?: string;
  reactionsPanelActive: boolean;
  setReactionsPanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  clickFunction?: () => void;
  reactionFunction?: (reaction: TableReactions) => void;
  options?: ReactButtonOptions;
}) {
  const reactButtonOptions = {
    ...reactButtonDefaultOptions,
    ...options,
  };
  const reactionsButtonRef = useRef<HTMLButtonElement>(null);
  const reactionsPanelScrollingContainerRef = useRef<HTMLDivElement>(null);
  const reactionsPanelRef = useRef<HTMLDivElement>(null);

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
        className={`${className} pointer-events-auto flex !aspect-square h-full items-center justify-end`}
        clickFunction={clickFunction}
        contentFunction={() => {
          const src = reactionsPanelActive ? reactionsOffIcon : reactionsIcon;

          return (
            <FgSVGElement
              src={src}
              className="h-full w-full fill-fg-white"
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
              ]}
            />
          );
        }}
        hoverContent={
          !reactionsPanelActive ? (
            <FgHoverContentStandard content={"Open reactions (q)"} />
          ) : undefined
        }
        options={{
          hoverType: reactButtonOptions.hoverType,
          hoverTimeoutDuration: reactButtonOptions.hoverTimeoutDuration,
          hoverZValue: 500000000000,
        }}
      />
      {reactionsPanelActive && (
        <FgPanel
          externalRef={reactionsPanelRef}
          content={
            <LazyScrollingContainer
              externalRef={reactionsPanelScrollingContainerRef}
              className="small-vertical-scroll-bar grid h-full w-full items-center justify-center gap-1 overflow-y-auto py-2"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(3rem, 3.5rem))",
              }}
              items={[
                ...Object.entries(reactionsMeta).map(([reaction, meta]) => (
                  <FgButton
                    key={reaction}
                    scrollingContainerRef={reactionsPanelScrollingContainerRef}
                    className="flex aspect-square w-full items-center justify-center rounded bg-fg-tone-black-1 hover:bg-fg-red-light"
                    clickFunction={
                      reactionFunction
                        ? () => reactionFunction(reaction as TableReactions)
                        : undefined
                    }
                    contentFunction={() =>
                      meta.type === "svg" ? (
                        <FgSVGElement
                          src={meta.src}
                          className="flex items-center justify-center"
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
                    options={{ hoverTimeoutDuration: 750 }}
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
          initWidth={"290px"}
          initHeight={"268px"}
          minWidth={176}
          minHeight={190}
          closeCallback={clickFunction}
          closeLabelElement={
            <FgHoverContentStandard content="Close (x)" style="dark" />
          }
          closePosition="topRight"
          shadow={{ top: true, bottom: true }}
          backgroundColor={"#161616"}
          secondaryBackgroundColor={"#212121"}
        />
      )}
    </>
  );
}
