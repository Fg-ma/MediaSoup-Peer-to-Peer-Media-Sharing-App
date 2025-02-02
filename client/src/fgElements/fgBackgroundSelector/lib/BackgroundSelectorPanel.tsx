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
import LazyScrollingContainer from "../../lazyScrollingContainer/LazyScrollingContainer";

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
  const backgroundSelectionSection = useRef<HTMLDivElement>(null);

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
          <div className='flex w-full h-full flex-col items-center justify-center space-y-2'>
            <input
              ref={fileSelectorRef}
              className='hidden'
              type='file'
              onChange={handleFileInput}
              multiple
            />
            <LazyScrollingContainer
              externalRef={backgroundSelectionSection}
              className='grid w-full grow overflow-y-auto grid-cols-3 gap-2 small-vertical-scroll-bar'
              items={[
                <FgButton
                  className='h-full aspect-square border-4 border-fg-white-75 hover:border-fg-secondary rounded'
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
                      className='w-full aspect-square border-4 border-fg-white-75 hover:border-fg-secondary rounded overflow-clip'
                      style={{
                        boxShadow: "inset 0px 0px 6px rgba(0, 0, 0, 0.5)",
                      }}
                      contentFunction={() => {
                        return (
                          <FgSVG
                            src={categoryMetadata.url}
                            className='flex items-center justify-center'
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
                  )
                ),
                activeBackground &&
                activeBackground.category !== "" &&
                activeBackground.categorySelection !== "" &&
                !Object.keys(recommendations).includes(
                  activeBackground.categorySelection
                ) ? (
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
                    scrollingContainerRef={backgroundSelectionSection}
                    options={{ hoverTimeoutDuration: 500 }}
                    clickFunction={() =>
                      handleSelectBackground(
                        activeBackground.category,
                        activeBackground.categorySelection
                      )
                    }
                  />
                ) : null,
                ...Object.entries(recommendations).map(
                  ([recommendationName, recommendation]) => (
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
                      scrollingContainerRef={backgroundSelectionSection}
                      options={{ hoverTimeoutDuration: 500 }}
                      clickFunction={() =>
                        handleSelectBackground(
                          recommendation.category,
                          recommendationName
                        )
                      }
                    />
                  )
                ),
              ]}
            />
          </div>
        ) : (
          <div className='flex w-full h-full flex-col items-center justify-center space-y-2'>
            <div className='flex w-full min-h-10 h-10 items-center justify-start space-x-2 rounded p-1'>
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
              <div className='text-3xl text-black font-Josefin pt-1.5'>
                {categoriesMetadata[activeCategory].label}
              </div>
            </div>
            <LazyScrollingContainer
              externalRef={backgroundSelectionSection}
              className='grid w-full grow overflow-y-auto grid-cols-3 gap-2 small-vertical-scroll-bar'
              items={[
                ...Object.entries(categories[activeCategory]).map(
                  ([categorySelection, categorySelectionData]) => {
                    return (
                      <FgButton
                        key={categorySelection}
                        className={`aspect-square w-full border-2 hover:border-fg-secondary rounded overflow-clip ${
                          activeBackground.categorySelection ===
                          categorySelection
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
                ),
              ]}
            />
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
