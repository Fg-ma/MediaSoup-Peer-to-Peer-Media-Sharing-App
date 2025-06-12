import React, { useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import { StaticContentTypes } from "../../../../universal/contentTypeConstant";
import FgPortal from "../fgPortal/FgPortal";
import LazyScrollingContainer from "../lazyScrollingContainer/LazyScrollingContainer";
import ScrollingContainer from "../scrollingContainer/ScrollingContainer";
import ScrollingContainerButton from "../scrollingContainer/lib/ScrollingContainerButton";
import Tools from "./lib/tools/Tools";
import AdvancedSection from "./lib/tools/advancedSection/AdvancedSection";
import TabledPortalController from "./lib/TabledPortalController";
import SearchBar from "./lib/tools/searchBar/SearchBar";
import TabledItems from "./lib/TabledItems";

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
  const { staticContentMedia } = useMediaContext();
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

  const tabledPortalController = useRef(
    new TabledPortalController(
      indicators,
      staticPlacement,
      selected,
      setRerender,
      tableStaticContentSocket,
      tabledPortalRef,
      tabledContentRef,
      setTabledActive,
    ),
  );

  return (
    <FgPortal
      externalPortalRef={tabledPortalRef}
      type="staticTopDomain"
      top={0}
      left={0}
      zValue={490000}
      className={`${dragging ? "!opacity-0 transition-opacity" : ""} flex h-full w-full items-center justify-center bg-fg-tone-black-1 bg-opacity-55`}
      content={
        <div
          className="flex h-full w-full items-center justify-center"
          onPointerDown={tabledPortalController.current.handlePortalClick}
        >
          <div
            ref={tabledContentRef}
            className={`${advanced ? "flex-row-reverse" : "flex-col"} flex h-[80%] w-[80%] items-center justify-center overflow-hidden rounded-md border-2 border-fg-off-white bg-fg-tone-black-6`}
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
                            selected.current = [];
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
                    ? Object.entries(staticContentMedia.current.svg.table).map(
                        ([svgId, svgMedia]) =>
                          (searchContent.length === 0 &&
                            svgMedia.state.includes("tabled")) ||
                          (searchContent.length !== 0 &&
                            searchContent.some(
                              (item) => item.sid === svgId,
                            )) ? (
                            <TabledItems
                              media={svgMedia}
                              contentType="svg"
                              contentId={svgId}
                              selected={selected}
                              filename={svgMedia.filename}
                              tabledSectionScrollingContainerRef={
                                tabledSectionScrollingContainerRef
                              }
                              lastPressed={lastPressed}
                              setDragging={setDragging}
                              holdTimeout={holdTimeout}
                              holdInterval={holdInterval}
                              addDownloadListener={
                                svgMedia.loadingState !== "downloaded"
                                  ? svgMedia.addSvgListener
                                  : undefined
                              }
                              removeDownloadListener={
                                svgMedia.loadingState !== "downloaded"
                                  ? svgMedia.removeSvgListener
                                  : undefined
                              }
                              setExternalRerender={setRerender}
                            />
                          ) : null,
                      )
                    : []),
                  ...(activePage === "all" || activePage === "image"
                    ? Object.entries(
                        staticContentMedia.current.image.table,
                      ).map(([imageId, imageMedia]) =>
                        (searchContent.length === 0 &&
                          imageMedia.state.includes("tabled")) ||
                        (searchContent.length !== 0 &&
                          searchContent.some(
                            (item) => item.iid === imageId,
                          )) ? (
                          <TabledItems
                            media={imageMedia}
                            contentType="image"
                            contentId={imageId}
                            selected={selected}
                            filename={imageMedia.filename}
                            tabledSectionScrollingContainerRef={
                              tabledSectionScrollingContainerRef
                            }
                            lastPressed={lastPressed}
                            setDragging={setDragging}
                            holdTimeout={holdTimeout}
                            holdInterval={holdInterval}
                            addDownloadListener={
                              imageMedia.loadingState !== "downloaded"
                                ? imageMedia.addImageListener
                                : undefined
                            }
                            removeDownloadListener={
                              imageMedia.loadingState !== "downloaded"
                                ? imageMedia.removeImageListener
                                : undefined
                            }
                            setExternalRerender={setRerender}
                          />
                        ) : null,
                      )
                    : []),
                  ...(activePage === "all" || activePage === "video"
                    ? Object.entries(
                        staticContentMedia.current.video.table,
                      ).map(([videoId, videoMedia]) =>
                        (searchContent.length === 0 &&
                          videoMedia.state.includes("tabled")) ||
                        (searchContent.length !== 0 &&
                          searchContent.some(
                            (item) => item.vid === videoId,
                          )) ? (
                          <TabledItems
                            media={videoMedia}
                            contentType="video"
                            contentId={videoId}
                            selected={selected}
                            filename={videoMedia.filename}
                            tabledSectionScrollingContainerRef={
                              tabledSectionScrollingContainerRef
                            }
                            lastPressed={lastPressed}
                            setDragging={setDragging}
                            holdTimeout={holdTimeout}
                            holdInterval={holdInterval}
                            addDownloadListener={
                              videoMedia.loadingState !== "downloaded"
                                ? videoMedia.addVideoListener
                                : undefined
                            }
                            removeDownloadListener={
                              videoMedia.loadingState !== "downloaded"
                                ? videoMedia.removeVideoListener
                                : undefined
                            }
                            setExternalRerender={setRerender}
                          />
                        ) : null,
                      )
                    : []),
                  ...(activePage === "all" || activePage === "soundClip"
                    ? Object.entries(
                        staticContentMedia.current.soundClip.table,
                      ).map(([soundClipId, soundClipMedia]) =>
                        (searchContent.length === 0 &&
                          soundClipMedia.state.includes("tabled")) ||
                        (searchContent.length !== 0 &&
                          searchContent.some(
                            (item) => item.sid === soundClipId,
                          )) ? (
                          <TabledItems
                            media={soundClipMedia}
                            contentType="soundClip"
                            contentId={soundClipId}
                            selected={selected}
                            filename={soundClipMedia.filename}
                            tabledSectionScrollingContainerRef={
                              tabledSectionScrollingContainerRef
                            }
                            lastPressed={lastPressed}
                            setDragging={setDragging}
                            holdTimeout={holdTimeout}
                            holdInterval={holdInterval}
                            addDownloadListener={
                              soundClipMedia.loadingState !== "downloaded"
                                ? soundClipMedia.addSoundClipListener
                                : undefined
                            }
                            removeDownloadListener={
                              soundClipMedia.loadingState !== "downloaded"
                                ? soundClipMedia.removeSoundClipListener
                                : undefined
                            }
                            setExternalRerender={setRerender}
                          />
                        ) : null,
                      )
                    : []),
                  ...(activePage === "all" || activePage === "application"
                    ? Object.entries(
                        staticContentMedia.current.application.table,
                      ).map(([applicationId, applicationMedia]) =>
                        (searchContent.length === 0 &&
                          applicationMedia.state.includes("tabled")) ||
                        (searchContent.length !== 0 &&
                          searchContent.some(
                            (item) => item.aid === applicationId,
                          )) ? (
                          <TabledItems
                            media={applicationMedia}
                            contentType="application"
                            contentId={applicationId}
                            selected={selected}
                            filename={applicationMedia.filename}
                            tabledSectionScrollingContainerRef={
                              tabledSectionScrollingContainerRef
                            }
                            lastPressed={lastPressed}
                            setDragging={setDragging}
                            holdTimeout={holdTimeout}
                            holdInterval={holdInterval}
                            addDownloadListener={
                              applicationMedia.loadingState !== "downloaded"
                                ? applicationMedia.addApplicationListener
                                : undefined
                            }
                            removeDownloadListener={
                              applicationMedia.loadingState !== "downloaded"
                                ? applicationMedia.removeApplicationListener
                                : undefined
                            }
                            setExternalRerender={setRerender}
                          />
                        ) : null,
                      )
                    : []),
                  ...(activePage === "all" || activePage === "text"
                    ? Object.entries(staticContentMedia.current.text.table).map(
                        ([textId, textMedia]) =>
                          (searchContent.length === 0 &&
                            textMedia.state.includes("tabled")) ||
                          (searchContent.length !== 0 &&
                            searchContent.some(
                              (item) => item.xid === textId,
                            )) ? (
                            <TabledItems
                              media={textMedia}
                              contentType="text"
                              contentId={textId}
                              selected={selected}
                              filename={textMedia.filename}
                              tabledSectionScrollingContainerRef={
                                tabledSectionScrollingContainerRef
                              }
                              lastPressed={lastPressed}
                              setDragging={setDragging}
                              holdTimeout={holdTimeout}
                              holdInterval={holdInterval}
                              addDownloadListener={
                                textMedia.loadingState !== "downloaded"
                                  ? textMedia.addTextListener
                                  : undefined
                              }
                              removeDownloadListener={
                                textMedia.loadingState !== "downloaded"
                                  ? textMedia.removeTextListener
                                  : undefined
                              }
                              setExternalRerender={setRerender}
                            />
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
