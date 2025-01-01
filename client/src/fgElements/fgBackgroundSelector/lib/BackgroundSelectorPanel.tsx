import React, { useRef, useState } from "react";
import FgPanel from "../../fgPanel/FgPanel";
import FgButton from "../../fgButton/FgButton";
import FgImageElement from "../../fgImageElement/FgImageElement";
import FgSVG from "../../fgSVG/FgSVG";
import FgHoverContentStandard from "../../fgHoverContentStandard/FgHoverContentStandard";
import {
  categories,
  Categories,
  categoriesMetadata,
  FgBackground,
  recommendations,
} from "./typeConstant";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetSeverBaseUrl + "svgs/additionIcon.svg";
const navigateBack = nginxAssetSeverBaseUrl + "svgs/navigateBack.svg";

export default function BackgroundSelectorPanel({
  setBackgroundSelectorPanelActive,
  backgroundSelectorBtnRef,
  activeBackground,
  setActiveBackground,
  imports,
  setImports,
}: {
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
  const userbackgroundsSectionRef = useRef<HTMLDivElement>(null);
  const recommendationsSectionRef = useRef<HTMLDivElement>(null);
  const categoriesSectionRef = useRef<HTMLDivElement>(null);
  const backgroundSelectionSection = useRef<HTMLDivElement>(null);

  const handleUserbackgroundsSectionWheel = (event: React.WheelEvent) => {
    if (!userbackgroundsSectionRef.current) {
      return;
    }

    userbackgroundsSectionRef.current.scrollLeft += event.deltaY;
  };

  const handleRecommendationsSectionWheel = (event: React.WheelEvent) => {
    if (!recommendationsSectionRef.current) {
      return;
    }

    recommendationsSectionRef.current.scrollLeft += event.deltaY;
  };

  const handleSelectBackground = (
    category: Categories | "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categorySelection: any
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
      content={
        activeCategory === "" ? (
          <div className='w-full h-full flex flex-col items-center justify-center space-y-2'>
            <input
              ref={fileSelectorRef}
              className='hidden'
              type='file'
              onChange={handleFileInput}
              multiple
            />
            <div
              ref={userbackgroundsSectionRef}
              className='w-full min-h-[4.5rem] h-[4.5rem] flex space-x-2 overflow-x-auto tiny-horizontal-scroll-bar'
              onWheel={handleUserbackgroundsSectionWheel}
            >
              <FgButton
                className='h-full aspect-square border-2 border-fg-white-75 hover:border-fg-secondary rounded'
                contentFunction={() => {
                  return (
                    <FgSVG
                      src={additionIcon}
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                        { key: "fill", value: "black" },
                        { key: "stroke", value: "black" },
                      ]}
                    />
                  );
                }}
                hoverContent={
                  <FgHoverContentStandard content='Import background' />
                }
                options={{ hoverTimeoutDuration: 500 }}
                clickFunction={() => {
                  fileSelectorRef.current?.click();
                }}
              />
              {Object.entries(imports).map(([filename, file]) => {
                return (
                  <FgButton
                    key={filename}
                    className={`aspect-square h-full border-2 hover:border-fg-secondary rounded overflow-clip ${
                      activeBackground.categorySelection === filename
                        ? "border-fg-secondary"
                        : "border-fg-white-75"
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
                    hoverContent={<FgHoverContentStandard content={filename} />}
                    scrollingContainerRef={userbackgroundsSectionRef}
                    options={{ hoverTimeoutDuration: 500 }}
                    clickFunction={() => handleSelectBackground("", filename)}
                  />
                );
              })}
            </div>
            <div className='relative w-full h-max bg-fg-white-90 rounded py-1 px-2'>
              <div className='text-xl w-full flex items-center justify-start'>
                Recommendations
              </div>
              <div
                ref={recommendationsSectionRef}
                className='w-full min-h-[4.5rem] h-[4.5rem] flex space-x-2 overflow-x-auto tiny-horizontal-scroll-bar'
                onWheel={handleRecommendationsSectionWheel}
              >
                {activeBackground &&
                  activeBackground.category !== "" &&
                  activeBackground.categorySelection !== "" &&
                  !Object.keys(recommendations).includes(
                    activeBackground.categorySelection
                  ) && (
                    <FgButton
                      className='aspect-square h-full border-2 border-fg-secondary rounded overflow-clip'
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
                      scrollingContainerRef={recommendationsSectionRef}
                      options={{ hoverTimeoutDuration: 500 }}
                      clickFunction={() =>
                        handleSelectBackground(
                          activeBackground.category,
                          activeBackground.categorySelection
                        )
                      }
                    />
                  )}
                {Object.entries(recommendations).map(
                  ([recommendationName, recommendation]) => {
                    return (
                      <FgButton
                        key={recommendationName}
                        className={`aspect-square h-full border-2 hover:border-fg-secondary rounded overflow-clip ${
                          activeBackground.categorySelection ===
                          recommendationName
                            ? "border-fg-secondary"
                            : "border-fg-white-75"
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
                        scrollingContainerRef={recommendationsSectionRef}
                        options={{ hoverTimeoutDuration: 500 }}
                        clickFunction={() =>
                          handleSelectBackground(
                            recommendation.category,
                            recommendationName
                          )
                        }
                      />
                    );
                  }
                )}
              </div>
            </div>
            <div className='text-xl w-full flex items-center justify-start'>
              Categories
            </div>
            <div
              ref={categoriesSectionRef}
              className='w-full grow overflow-y-auto grid grid-cols-3 gap-2 small-vertical-scroll-bar'
            >
              {Object.entries(categoriesMetadata).map(
                ([categoryName, categoryMetadata]) => {
                  return (
                    <FgButton
                      key={categoryName}
                      className='w-full h-full border-2 border-fg-white-75 hover:border-fg-secondary rounded overflow-clip'
                      contentFunction={() => {
                        return (
                          <FgSVG
                            src={categoryMetadata.url}
                            attributes={[
                              { key: "width", value: "100%" },
                              { key: "height", value: "100%" },
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
                      scrollingContainerRef={categoriesSectionRef}
                    />
                  );
                }
              )}
            </div>
          </div>
        ) : (
          <div className='w-full h-full flex flex-col items-center justify-center space-y-2'>
            <div className='w-full min-h-8 h-8 flex items-center justify-start space-x-2 bg-fg-white-90 rounded p-1'>
              <FgButton
                className='flex items-center justify-center h-4/5 aspect-square relative'
                contentFunction={() => {
                  return (
                    <FgSVG
                      src={navigateBack}
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                        { key: "fill", value: "black" },
                        { key: "stroke", value: "black" },
                      ]}
                    />
                  );
                }}
                clickFunction={() => {
                  setActiveCategory("");
                }}
                hoverContent={<FgHoverContentStandard content='Back' />}
                options={{ hoverType: "above", hoverTimeoutDuration: 750 }}
              />
              <div className='text-2xl text-black pb-1'>
                {categoriesMetadata[activeCategory].label}
              </div>
            </div>
            <div
              ref={backgroundSelectionSection}
              className='w-full grow overflow-y-auto grid grid-cols-3 gap-2 small-vertical-scroll-bar'
            >
              {Object.entries(categories[activeCategory]).map(
                ([categorySelection, categorySelectionData]) => {
                  return (
                    <FgButton
                      key={categorySelection}
                      className={`aspect-square w-full border-2 hover:border-fg-secondary rounded overflow-clip ${
                        activeBackground.categorySelection === categorySelection
                          ? "border-fg-secondary"
                          : "border-fg-white-75"
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
                          categorySelection
                        )
                      }
                    />
                  );
                }
              )}
            </div>
          </div>
        )
      }
      initWidth='400px'
      initHeight='380px'
      minWidth={400}
      minHeight={314}
      closePosition={"topRight"}
      closeCallback={() => setBackgroundSelectorPanelActive((prev) => !prev)}
      initPosition={{
        referenceElement: backgroundSelectorBtnRef.current as HTMLElement,
        placement: "below",
        padding: 4,
      }}
    />
  );
}
