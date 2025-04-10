import React, { useRef, useState } from "react";
import FgPanel from "../../fgPanel/FgPanel";
import FgButton from "../../fgButton/FgButton";
import FgImageElement from "../../fgImageElement/FgImageElement";
import FgSVGElement from "../../fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../fgHoverContentStandard/FgHoverContentStandard";
import {
  categories,
  Categories,
  categoriesMetadata,
  FgBackground,
  recommendations,
} from "./typeConstant";
import LazyScrollingContainer from "../../lazyScrollingContainer/LazyScrollingContainer";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const navigateBack = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function BackgroundSelectorPanel({
  externalPanelRef,
  setBackgroundSelectorPanelActive,
  backgroundSelectorBtnRef,
  activeBackground,
  setActiveBackground,
  imports,
  setImports,
}: {
  externalPanelRef?: React.RefObject<HTMLDivElement>;
  setBackgroundSelectorPanelActive: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  backgroundSelectorBtnRef: React.RefObject<HTMLButtonElement>;
  activeBackground:
    | FgBackground
    | {
        category: "";
        categorySelection: string;
      };
  setActiveBackground: React.Dispatch<
    React.SetStateAction<
      | FgBackground
      | {
          category: "";
          categorySelection: string;
        }
    >
  >;
  imports: {
    [importFilename: string]: {
      file: File;
      url: string;
    };
  };
  setImports: React.Dispatch<
    React.SetStateAction<{
      [importFilename: string]: {
        file: File;
        url: string;
      };
    }>
  >;
}) {
  const [activeCategory, setActiveCategory] = useState<Categories | "">("");

  const fileSelectorRef = useRef<HTMLInputElement>(null);
  const backgroundSelectionSection = useRef<HTMLDivElement>(null);

  const handleSelectBackground = (
    category: Categories | "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categorySelection: any,
  ) => {
    if (activeBackground.categorySelection !== categorySelection) {
      setActiveBackground({
        category,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        categorySelection: categorySelection as any,
      });
    } else {
      setActiveBackground({
        category,
        categorySelection: "",
      });
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImports: {
        [importFilename: string]: { file: File; url: string };
      } = {};
      for (const file of files) {
        newImports[file.name] = { file: file, url: URL.createObjectURL(file) };
      }
      setImports((prev) => ({ ...newImports, ...prev }));
    }
  };

  return (
    <FgPanel
      externalRef={externalPanelRef}
      content={
        activeCategory === "" ? (
          <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
            <input
              ref={fileSelectorRef}
              className="hidden"
              type="file"
              onChange={handleFileInput}
              multiple
            />
            <LazyScrollingContainer
              externalRef={backgroundSelectionSection}
              className="small-vertical-scroll-bar grid w-full grow grid-cols-3 gap-2 overflow-y-auto"
              items={[
                <FgButton
                  className="flex aspect-square w-full items-center justify-center rounded border-2 border-fg-red bg-fg-tone-black-4 fill-fg-red stroke-fg-red hover:border-3 hover:border-fg-red-light hover:fill-fg-red-light hover:stroke-fg-red-light"
                  contentFunction={() => (
                    <FgSVGElement
                      src={additionIcon}
                      className="aspect-square h-[70%]"
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                      ]}
                    />
                  )}
                  hoverContent={
                    <FgHoverContentStandard content="Import background" />
                  }
                  scrollingContainerRef={backgroundSelectionSection}
                  options={{ hoverTimeoutDuration: 500 }}
                  clickFunction={() => {
                    fileSelectorRef.current?.click();
                  }}
                />,
                Object.keys(imports).length > 0
                  ? Object.entries(imports).map(([filename, file]) => {
                      return (
                        <FgButton
                          key={filename}
                          className={`flex aspect-square h-full items-center justify-center overflow-clip rounded border-2 hover:border-3 hover:border-fg-red-light ${
                            activeBackground.categorySelection === filename
                              ? "border-fg-red-light"
                              : "border-fg-black-35"
                          }`}
                          contentFunction={() => {
                            return (
                              <FgImageElement
                                src={file.url}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            );
                          }}
                          hoverContent={
                            <FgHoverContentStandard content={filename} />
                          }
                          scrollingContainerRef={backgroundSelectionSection}
                          options={{ hoverTimeoutDuration: 500 }}
                          clickFunction={() =>
                            handleSelectBackground("", filename)
                          }
                        />
                      );
                    })
                  : null,
                ...Object.entries(categoriesMetadata).map(
                  ([categoryName, categoryMetadata]) => (
                    <FgButton
                      key={categoryName}
                      className="flex aspect-square h-full items-center justify-center overflow-clip rounded border-2 border-fg-black-35 shadow shadow-fg-red hover:border-3 hover:border-fg-red-light"
                      contentFunction={() => {
                        return (
                          <FgSVGElement
                            src={categoryMetadata.url}
                            className="flex items-center justify-center"
                            attributes={[
                              { key: "width", value: "80%" },
                              { key: "height", value: "80%" },
                            ]}
                          />
                        );
                      }}
                      clickFunction={() => {
                        setActiveCategory(categoryName as Categories);
                      }}
                      hoverContent={
                        <FgHoverContentStandard
                          content={categoryMetadata.label}
                        />
                      }
                      options={{ hoverTimeoutDuration: 500 }}
                      scrollingContainerRef={backgroundSelectionSection}
                    />
                  ),
                ),
                activeBackground &&
                activeBackground.category !== "" &&
                activeBackground.categorySelection !== "" &&
                !Object.keys(recommendations).includes(
                  activeBackground.categorySelection,
                ) ? (
                  <FgButton
                    className="flex aspect-square h-full items-center justify-center overflow-clip rounded border-2 hover:border-3 hover:border-fg-red-light"
                    contentFunction={() => {
                      const data =
                        // @ts-expect-error: type correspondance issue
                        categories[activeBackground.category][
                          activeBackground.categorySelection
                        ];

                      return (
                        <FgImageElement
                          src={data.url}
                          srcLoading={data.loadingUrl}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      );
                    }}
                    hoverContent={
                      <FgHoverContentStandard
                        content={
                          // @ts-expect-error: type correspondance issue
                          categories[activeBackground.category][
                            activeBackground.categorySelection
                          ].label
                        }
                      />
                    }
                    scrollingContainerRef={backgroundSelectionSection}
                    options={{ hoverTimeoutDuration: 500 }}
                    clickFunction={() =>
                      handleSelectBackground(
                        activeBackground.category,
                        activeBackground.categorySelection,
                      )
                    }
                  />
                ) : null,
                ...Object.entries(recommendations).map(
                  ([recommendationName, recommendation]) => (
                    <FgButton
                      key={recommendationName}
                      className={`flex aspect-square h-full items-center justify-center overflow-clip rounded border-2 hover:border-3 hover:border-fg-red-light ${
                        activeBackground.categorySelection ===
                        recommendationName
                          ? "border-fg-red-light"
                          : "border-fg-black-35"
                      }`}
                      contentFunction={() => {
                        return (
                          <FgImageElement
                            src={recommendation.url}
                            srcLoading={recommendation.loadingUrl}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        );
                      }}
                      hoverContent={
                        <FgHoverContentStandard
                          content={recommendation.label}
                        />
                      }
                      scrollingContainerRef={backgroundSelectionSection}
                      options={{ hoverTimeoutDuration: 500 }}
                      clickFunction={() =>
                        handleSelectBackground(
                          recommendation.category,
                          recommendationName,
                        )
                      }
                    />
                  ),
                ),
              ]}
            />
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
            <div className="flex h-10 min-h-10 w-full items-center justify-start space-x-2 rounded p-1">
              <FgButton
                className="relative flex aspect-square h-4/5 items-center justify-center"
                contentFunction={() => {
                  return (
                    <FgSVGElement
                      src={navigateBack}
                      className="fill-fg-off-white stroke-fg-off-white"
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                      ]}
                    />
                  );
                }}
                clickFunction={() => {
                  setActiveCategory("");
                }}
                hoverContent={<FgHoverContentStandard content="Back" />}
                options={{ hoverType: "above", hoverTimeoutDuration: 750 }}
              />
              <div
                className="cursor-pointer pt-1.5 font-Josefin text-3xl text-fg-off-white"
                onClick={() => {
                  setActiveCategory("");
                }}
              >
                {categoriesMetadata[activeCategory].label}
              </div>
            </div>
            <LazyScrollingContainer
              externalRef={backgroundSelectionSection}
              className="small-vertical-scroll-bar grid w-full grow grid-cols-3 gap-2 overflow-y-auto"
              items={[
                ...Object.entries(categories[activeCategory]).map(
                  ([categorySelection, categorySelectionData]) => {
                    return (
                      <FgButton
                        key={categorySelection}
                        className={`flex aspect-square h-full items-center justify-center overflow-clip rounded border-2 hover:border-3 hover:border-fg-red-light ${
                          activeBackground.categorySelection ===
                          categorySelection
                            ? "border-fg-red-light"
                            : "border-fg-black-35"
                        }`}
                        contentFunction={() => {
                          return (
                            <FgImageElement
                              src={categorySelectionData.url}
                              srcLoading={categorySelectionData.loadingUrl}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          );
                        }}
                        hoverContent={
                          <FgHoverContentStandard
                            content={categorySelectionData.label}
                          />
                        }
                        scrollingContainerRef={backgroundSelectionSection}
                        options={{ hoverTimeoutDuration: 500 }}
                        clickFunction={() =>
                          handleSelectBackground(
                            activeCategory,
                            categorySelection,
                          )
                        }
                      />
                    );
                  },
                ),
              ]}
            />
          </div>
        )
      }
      initWidth="400px"
      initHeight="380px"
      minWidth={400}
      minHeight={314}
      closePosition={"topRight"}
      closeCallback={() => setBackgroundSelectorPanelActive((prev) => !prev)}
      initPosition={{
        referenceElement: backgroundSelectorBtnRef.current as HTMLElement,
        placement: "below",
        padding: 4,
      }}
      backgroundColor={"#161616"}
      secondaryBackgroundColor={"#212121"}
    />
  );
}
