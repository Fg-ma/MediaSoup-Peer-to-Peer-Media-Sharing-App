import React, { useRef, useState } from "react";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import FgPortal from "../fgPortal/FgPortal";
import LazyScrollingContainer from "../lazyScrollingContainer/LazyScrollingContainer";
import Tools from "./lib/tools/Tools";
import AdvancedSection from "./lib/tools/advancedSection/AdvancedSection";
import LittleBuddyPortalController from "./lib/LittleBuddyPortalController";
import SearchBar from "./lib/tools/searchBar/SearchBar";
import LittleBuddyItems from "./lib/LittleBuddyItems";
import {
  LittleBuddiesTypes,
  spirteSheetsMeta,
} from "../../tableBabylon/littleBuddies/lib/typeConstant";

export type LittleBuddyInstanceType = {
  littleBuddy: LittleBuddiesTypes;
  width: number;
  height: number;
  x: number;
  y: number;
};

export default function LittleBuddyPortal({
  dragging,
  setDragging,
  setLittleBuddyActive,
}: {
  dragging: boolean;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setLittleBuddyActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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
    | {
        littleBuddy: LittleBuddiesTypes;
        aspect: number;
      }
    | undefined
  >(undefined);

  const indicators = useRef<LittleBuddyInstanceType | undefined>(undefined);
  const [searchContent, setSearchContent] = useState<
    {
      littleBuddy: LittleBuddiesTypes;
      score: number;
    }[]
  >([]);
  const littleBuddyPortalRef = useRef<HTMLDivElement>(null);
  const littleBuddyContentRef = useRef<HTMLDivElement>(null);
  const searchValue = useRef("");

  const [_, setRerender] = useState(false);

  const littleBuddyPortalController = useRef(
    new LittleBuddyPortalController(
      indicators,
      staticPlacement,
      selected,
      setRerender,
      tableStaticContentSocket,
      littleBuddyPortalRef,
      littleBuddyContentRef,
      setLittleBuddyActive,
    ),
  );

  return (
    <FgPortal
      externalPortalRef={littleBuddyPortalRef}
      type="staticTopDomain"
      top={0}
      left={0}
      zValue={490000}
      className={`${dragging ? "!opacity-0 transition-opacity" : ""} flex h-full w-full items-center justify-center bg-fg-tone-black-1 bg-opacity-55`}
      content={
        <div
          className="flex h-full w-full items-center justify-center"
          onPointerDown={littleBuddyPortalController.current.handlePortalClick}
        >
          <div
            ref={littleBuddyContentRef}
            className={`${advanced ? "flex-row-reverse" : "flex-col"} flex h-[80%] w-[80%] items-center justify-center overflow-hidden rounded-md border-2 border-fg-off-white bg-fg-tone-black-6`}
          >
            <div
              className={`${advanced ? "h-full" : ""} flex grow flex-col`}
              style={{
                width: advanced ? "calc(100% - 14.5rem)" : "100%",
              }}
            >
              <LazyScrollingContainer
                className={`${advanced ? "h-full" : "w-full"} small-vertical-scroll-bar grid grow gap-1 overflow-y-auto p-2`}
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(3rem, 6rem))",
                  gridAutoRows: "max-content",
                }}
                items={
                  searchContent.length > 0
                    ? searchContent.map((content) => (
                        <LittleBuddyItems
                          littleBuddy={content.littleBuddy}
                          selected={selected}
                          setDragging={setDragging}
                          setExternalRerender={setRerender}
                        />
                      ))
                    : Object.keys(spirteSheetsMeta).map((littleBuddy) => (
                        <LittleBuddyItems
                          littleBuddy={littleBuddy as LittleBuddiesTypes}
                          selected={selected}
                          setDragging={setDragging}
                          setExternalRerender={setRerender}
                        />
                      ))
                }
              />
              {advanced && (
                <SearchBar
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
                  littleBuddyPortalController={littleBuddyPortalController}
                />
              )}
              <Tools
                littleBuddyPortalController={littleBuddyPortalController}
                advanced={advanced}
                setAdvanced={setAdvanced}
                setLittleBuddyActive={setLittleBuddyActive}
                setSearchContent={setSearchContent}
                searchValue={searchValue}
                selected={selected}
              />
            </div>
          </div>
        </div>
      }
      options={{ animate: false }}
    />
  );
}
