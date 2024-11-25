import React, { useRef, useState } from "react";
import FgPanel from "../../fgElements/fgPanel/FgPanel";
import FgButton from "../../fgElements/fgButton/FgButton";
import FgImage from "../../fgElements/fgImage/FgImage";
import FgSVG from "../../fgElements/fgSVG/FgSVG";

import additionIcon from "../../../public/svgs/additionIcon.svg";
import navigateBack from "../../../public/svgs/navigateBack.svg";
import ChristmasIcon from "../../../public/svgs/christmasIcon.svg";
import geometricIcon from "../../../public/svgs/geometricIcon.svg";
import natureIcon from "../../../public/svgs/natureIcon.svg";
import spaceIcon from "../../../public/svgs/spaceIcon.svg";
import technologyIcon from "../../../public/svgs/technologyIcon.svg";

import whiteChristmas_1280x910 from "../../../public/backgroundImages/christmas/whiteChristmas_1280x910.png";
import whiteChristmas_64x46 from "../../../public/backgroundImages/christmas/whiteChristmas_64x46.png";
import geometric1_1280x720 from "../../../public/backgroundImages/geometric/geometric1_1280x720.png";
import geometric1_64x36 from "../../../public/backgroundImages/geometric/geometric1_64x36.png";
import geometric2_1280x720 from "../../../public/backgroundImages/geometric/geometric2_1280x720.png";
import geometric2_64x36 from "../../../public/backgroundImages/geometric/geometric2_64x36.png";
import geometric3_1280x720 from "../../../public/backgroundImages/geometric/geometric3_1280x720.png";
import geometric3_64x36 from "../../../public/backgroundImages/geometric/geometric3_64x36.png";
import geometric4_1280x843 from "../../../public/backgroundImages/geometric/geometric4_1280x843.png";
import geometric4_64x42 from "../../../public/backgroundImages/geometric/geometric4_64x42.png";
import geometric5_1280x959 from "../../../public/backgroundImages/geometric/geometric5_1280x959.png";
import geometric5_64x48 from "../../../public/backgroundImages/geometric/geometric5_64x48.png";
import geometric6_1280x720 from "../../../public/backgroundImages/geometric/geometric6_1280x720.png";
import geometric6_64x36 from "../../../public/backgroundImages/geometric/geometric6_64x36.png";
import birds_1280x841 from "../../../public/backgroundImages/nature/birds_1280x841.png";
import birds_64x42 from "../../../public/backgroundImages/nature/birds_64x42.png";
import cave_1280x1011 from "../../../public/backgroundImages/nature/cave_1280x1011.png";
import cave_64x51 from "../../../public/backgroundImages/nature/cave_64x51.png";
import clearing_1205x1280 from "../../../public/backgroundImages/nature/clearing_1205x1280.png";
import clearing_60x64 from "../../../public/backgroundImages/nature/clearing_60x64.png";
import flowering_1280x1280 from "../../../public/backgroundImages/nature/flowering_1280x1280.png";
import flowering_64x64 from "../../../public/backgroundImages/nature/flowering_64x64.png";
import fungus_1280x1172 from "../../../public/backgroundImages/nature/fungus_1280x1172.png";
import fungus_64x59 from "../../../public/backgroundImages/nature/fungus_64x59.png";
import mountains_1024x1280 from "../../../public/backgroundImages/nature/mountains_1024x1280.png";
import mountains_51x64 from "../../../public/backgroundImages/nature/mountains_51x64.png";
import rollingHills_1280x827 from "../../../public/backgroundImages/nature/rollingHills_1280x827.png";
import rollingHills_64x41 from "../../../public/backgroundImages/nature/rollingHills_64x41.png";
import shoreSide_1024x1280 from "../../../public/backgroundImages/nature/shoreSide_1024x1280.png";
import shoreSide_51x64 from "../../../public/backgroundImages/nature/shoreSide_51x64.png";
import sprouting_1280x1280 from "../../../public/backgroundImages/nature/sprouting_1280x1280.png";
import sprouting_64x64 from "../../../public/backgroundImages/nature/sprouting_64x64.png";
import submarine_854x1280 from "../../../public/backgroundImages/nature/submarine_854x1280.png";
import submarine_43x64 from "../../../public/backgroundImages/nature/submarine_43x64.png";
import sunnySideUp_1280x1280 from "../../../public/backgroundImages/nature/sunnySideUp_1280x1280.png";
import sunnySideUp_64x64 from "../../../public/backgroundImages/nature/sunnySideUp_64x64.png";
import bigDipper_1280x1277 from "../../../public/backgroundImages/space/bigDipper_1280x1277.png";
import bigDipper_64x64 from "../../../public/backgroundImages/space/bigDipper_64x64.png";
import blueBall_1280x800 from "../../../public/backgroundImages/space/blueBall_1280x800.png";
import blueBall_64x40 from "../../../public/backgroundImages/space/blueBall_64x40.png";
import overTheMoon_1280x915 from "../../../public/backgroundImages/space/overTheMoon_1280x915.png";
import overTheMoon_64x46 from "../../../public/backgroundImages/space/overTheMoon_64x46.png";
import rocket_1024x1280 from "../../../public/backgroundImages/space/rocket_1024x1280.png";
import rocket_51x64 from "../../../public/backgroundImages/space/rocket_51x64.png";
import solarParty_960x1280 from "../../../public/backgroundImages/space/solarParty_960x1280.png";
import solarParty_48x64 from "../../../public/backgroundImages/space/solarParty_48x64.png";
import starMap_1169x1280 from "../../../public/backgroundImages/space/starMap_1169x1280.png";
import starMap_58x64 from "../../../public/backgroundImages/space/starMap_58x64.png";
import binary_1280x1280 from "../../../public/backgroundImages/technology/binary_1280x1280.png";
import binary_64x64 from "../../../public/backgroundImages/technology/binary_64x64.png";
import calculator_973x1280 from "../../../public/backgroundImages/technology/calculator_973x1280.png";
import calculator_49x64 from "../../../public/backgroundImages/technology/calculator_49x64.png";
import circuit_1280x1273 from "../../../public/backgroundImages/technology/circuit_1280x1273.png";
import circuit_64x64 from "../../../public/backgroundImages/technology/circuit_64x64.png";
import robot_854x1280 from "../../../public/backgroundImages/technology/robot_854x1280.png";
import robot_43x64 from "../../../public/backgroundImages/technology/robot_43x64.png";
import technology1_963x1280 from "../../../public/backgroundImages/technology/technology1_963x1280.png";
import technology1_48x64 from "../../../public/backgroundImages/technology/technology1_48x64.png";
import technology2_985x1280 from "../../../public/backgroundImages/technology/technology2_985x1280.png";
import technology2_49x64 from "../../../public/backgroundImages/technology/technology2_49x64.png";
import WWW_1280x1280 from "../../../public/backgroundImages/technology/WWW_1280x1280.png";
import WWW_64x64 from "../../../public/backgroundImages/technology/WWW_64x64.png";

type Categories = "christmas" | "geometric" | "nature" | "space" | "technology";
type ChristmasCategories = "whiteChristmas";
type GeometricCategories =
  | "geometric1"
  | "geometric2"
  | "geometric3"
  | "geometric4"
  | "geometric5"
  | "geometric6";
type NatureCategories =
  | "birds"
  | "cave"
  | "clearing"
  | "flowering"
  | "fungus"
  | "mountains"
  | "rollingHills"
  | "shoreSide"
  | "sprouting"
  | "submarine"
  | "sunnySideUp";
type SpaceCategories =
  | "bigDipper"
  | "blueBall"
  | "overTheMoon"
  | "rocket"
  | "solarParty"
  | "starMap";
type TechnologyCategories =
  | "binary"
  | "calculator"
  | "circuit"
  | "robot"
  | "technology1"
  | "technology2"
  | "WWW";

const categoriesMetadata: {
  [category in Categories]: { label: string; url: string };
} = {
  christmas: { label: "Christmas", url: ChristmasIcon },
  geometric: { label: "Geometric", url: geometricIcon },
  nature: { label: "Nature", url: natureIcon },
  space: { label: "Space", url: spaceIcon },
  technology: { label: "Technology", url: technologyIcon },
};

const recommendations: {
  [christmasCategory in
    | ChristmasCategories
    | GeometricCategories
    | NatureCategories
    | SpaceCategories
    | TechnologyCategories]?: {
    label: string;
    url: string;
    loadingUrl: string;
  };
} = {
  geometric4: {
    label: "Geometric 4",
    url: geometric4_1280x843,
    loadingUrl: geometric4_64x42,
  },
  geometric6: {
    label: "Geometric 6",
    url: geometric6_1280x720,
    loadingUrl: geometric6_64x36,
  },
  mountains: {
    label: "Mountains",
    url: mountains_1024x1280,
    loadingUrl: mountains_51x64,
  },
  shoreSide: {
    label: "Shore side",
    url: shoreSide_1024x1280,
    loadingUrl: shoreSide_51x64,
  },
  submarine: {
    label: "Submarine",
    url: submarine_854x1280,
    loadingUrl: submarine_43x64,
  },
  sunnySideUp: {
    label: "Sunny side up",
    url: sunnySideUp_1280x1280,
    loadingUrl: sunnySideUp_64x64,
  },
  blueBall: {
    label: "Blue ball",
    url: blueBall_1280x800,
    loadingUrl: blueBall_64x40,
  },
  solarParty: {
    label: "Solar party",
    url: solarParty_960x1280,
    loadingUrl: solarParty_48x64,
  },
  starMap: {
    label: "Star map",
    url: starMap_1169x1280,
    loadingUrl: starMap_58x64,
  },
  binary: { label: "Binary", url: binary_1280x1280, loadingUrl: binary_64x64 },
  circuit: {
    label: "Circuit",
    url: circuit_1280x1273,
    loadingUrl: circuit_64x64,
  },
  robot: { label: "Robot", url: robot_854x1280, loadingUrl: robot_43x64 },
};

const categories: {
  christmas: {
    [christmasCategory in ChristmasCategories]: {
      label: string;
      url: string;
      loadingUrl: string;
    };
  };
  geometric: {
    [geometricCategory in GeometricCategories]: {
      label: string;
      url: string;
      loadingUrl: string;
    };
  };
  nature: {
    [natureCategory in NatureCategories]: {
      label: string;
      url: string;
      loadingUrl: string;
    };
  };
  space: {
    [spaceCategory in SpaceCategories]: {
      label: string;
      url: string;
      loadingUrl: string;
    };
  };
  technology: {
    [technologyCategory in TechnologyCategories]: {
      label: string;
      url: string;
      loadingUrl: string;
    };
  };
} = {
  christmas: {
    whiteChristmas: {
      label: "White christmas",
      url: whiteChristmas_1280x910,
      loadingUrl: whiteChristmas_64x46,
    },
  },
  geometric: {
    geometric1: {
      label: "Geometric 1",
      url: geometric1_1280x720,
      loadingUrl: geometric1_64x36,
    },
    geometric2: {
      label: "Geometric 2",
      url: geometric2_1280x720,
      loadingUrl: geometric2_64x36,
    },
    geometric3: {
      label: "Geometric 3",
      url: geometric3_1280x720,
      loadingUrl: geometric3_64x36,
    },
    geometric4: {
      label: "Geometric 4",
      url: geometric4_1280x843,
      loadingUrl: geometric4_64x42,
    },
    geometric5: {
      label: "Geometric 5",
      url: geometric5_1280x959,
      loadingUrl: geometric5_64x48,
    },
    geometric6: {
      label: "Geometric 6",
      url: geometric6_1280x720,
      loadingUrl: geometric6_64x36,
    },
  },
  nature: {
    birds: { label: "Birds", url: birds_1280x841, loadingUrl: birds_64x42 },
    cave: { label: "Cave", url: cave_1280x1011, loadingUrl: cave_64x51 },
    clearing: {
      label: "Clearing",
      url: clearing_1205x1280,
      loadingUrl: clearing_60x64,
    },
    flowering: {
      label: "Flowering",
      url: flowering_1280x1280,
      loadingUrl: flowering_64x64,
    },
    fungus: {
      label: "Fungus",
      url: fungus_1280x1172,
      loadingUrl: fungus_64x59,
    },
    mountains: {
      label: "Mountains",
      url: mountains_1024x1280,
      loadingUrl: mountains_51x64,
    },
    rollingHills: {
      label: "Rolling hills",
      url: rollingHills_1280x827,
      loadingUrl: rollingHills_64x41,
    },
    shoreSide: {
      label: "Shore side",
      url: shoreSide_1024x1280,
      loadingUrl: shoreSide_51x64,
    },
    sprouting: {
      label: "Sprouting",
      url: sprouting_1280x1280,
      loadingUrl: sprouting_64x64,
    },
    submarine: {
      label: "Submarine",
      url: submarine_854x1280,
      loadingUrl: submarine_43x64,
    },
    sunnySideUp: {
      label: "Sunny side up",
      url: sunnySideUp_1280x1280,
      loadingUrl: sunnySideUp_64x64,
    },
  },
  space: {
    bigDipper: {
      label: "Big dipper",
      url: bigDipper_1280x1277,
      loadingUrl: bigDipper_64x64,
    },
    blueBall: {
      label: "Blue ball",
      url: blueBall_1280x800,
      loadingUrl: blueBall_64x40,
    },
    overTheMoon: {
      label: "Over the moon",
      url: overTheMoon_1280x915,
      loadingUrl: overTheMoon_64x46,
    },
    rocket: {
      label: "Rocket",
      url: rocket_1024x1280,
      loadingUrl: rocket_51x64,
    },
    solarParty: {
      label: "Solar party",
      url: solarParty_960x1280,
      loadingUrl: solarParty_48x64,
    },
    starMap: {
      label: "Star map",
      url: starMap_1169x1280,
      loadingUrl: starMap_58x64,
    },
  },
  technology: {
    binary: {
      label: "Binary",
      url: binary_1280x1280,
      loadingUrl: binary_64x64,
    },
    calculator: {
      label: "Calculator",
      url: calculator_973x1280,
      loadingUrl: calculator_49x64,
    },
    circuit: {
      label: "Circuit",
      url: circuit_1280x1273,
      loadingUrl: circuit_64x64,
    },
    robot: { label: "Robot", url: robot_854x1280, loadingUrl: robot_43x64 },
    technology1: {
      label: "Technology 1",
      url: technology1_963x1280,
      loadingUrl: technology1_48x64,
    },
    technology2: {
      label: "Technology 2",
      url: technology2_985x1280,
      loadingUrl: technology2_49x64,
    },
    WWW: { label: "World Wide Web", url: WWW_1280x1280, loadingUrl: WWW_64x64 },
  },
};

export default function BackgroundSelectorPanel({
  setBackgroundSelectorPanelActive,
  backgroundSelectorBtnRef,
}: {
  setBackgroundSelectorPanelActive: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  backgroundSelectorBtnRef: React.RefObject<HTMLButtonElement>;
}) {
  const [activeCategory, setActiveCategory] = useState<Categories | "">("");
  const activeBackground = useState<
    | { category: ""; categorySelection: "" }
    | { category: "christmas"; categorySelection: ChristmasCategories | "" }
    | { category: "geometric"; categorySelection: GeometricCategories | "" }
    | { category: "nature"; categorySelection: NatureCategories | "" }
    | { category: "space"; categorySelection: SpaceCategories | "" }
    | { category: "technology"; categorySelection: TechnologyCategories | "" }
  >({ category: "", categorySelection: "" });

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
    category: Categories,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categorySelection: any
  ) => {
    if (activeBackground.current.categorySelection !== categorySelection) {
      setActiveCategory("");
    }
    if (activeBackground.current.categorySelection !== categorySelection) {
      activeBackground.current = {
        category,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        categorySelection: categorySelection as any,
      };
    } else {
      activeBackground.current = {
        category,
        categorySelection: "",
      };
    }
  };

  return (
    <FgPanel
      content={
        activeCategory === "" ? (
          <div className='w-full h-full flex flex-col items-center justify-center space-y-2'>
            <div
              ref={userbackgroundsSectionRef}
              className='w-full min-h-16 h-16 flex space-x-2 overflow-x-auto tiny-horizontal-scroll-bar'
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
                  <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                    Import background
                  </div>
                }
                options={{ hoverTimeoutDuration: 500 }}
              />
            </div>
            <div
              ref={recommendationsSectionRef}
              className='w-full min-h-[4.5rem] h-[4.5rem] flex space-x-2 overflow-x-auto tiny-horizontal-scroll-bar'
              onWheel={handleRecommendationsSectionWheel}
            >
              {activeBackground.current &&
                activeBackground.current.category !== "" &&
                activeBackground.current.categorySelection !== "" && (
                  <FgButton
                    className='aspect-square h-full border-2 border-fg-secondary rounded'
                    contentFunction={() => {
                      const data =
                        // @ts-expect-error: type correspondance issue
                        categories[activeBackground.current.category][
                          activeBackground.current.categorySelection
                        ];

                      return (
                        <FgImage
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
                      <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                        {
                          // @ts-expect-error: type correspondance issue
                          categories[activeBackground.current.category][
                            activeBackground.current.categorySelection
                          ].label
                        }
                      </div>
                    }
                    scrollingContainerRef={recommendationsSectionRef}
                    options={{ hoverTimeoutDuration: 500 }}
                  />
                )}
              {Object.entries(recommendations).map(
                ([recommendationName, recommendation]) => {
                  if (
                    activeBackground.current.categorySelection !==
                    recommendationName
                  ) {
                    return (
                      <FgButton
                        key={recommendationName}
                        className='aspect-square h-full border-2 border-fg-white-75 hover:border-fg-secondary rounded'
                        contentFunction={() => {
                          return (
                            <FgImage
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
                          <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                            {recommendation.label}
                          </div>
                        }
                        scrollingContainerRef={recommendationsSectionRef}
                        options={{ hoverTimeoutDuration: 500 }}
                      />
                    );
                  }
                }
              )}
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
                      className='w-full h-full border-2 border-fg-white-75 hover:border-fg-secondary rounded'
                      contentFunction={() => {
                        return (
                          <FgSVG
                            src={categoryMetadata.url}
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
                        setActiveCategory(categoryName as Categories);
                      }}
                      hoverContent={
                        <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                          {categoryMetadata.label}
                        </div>
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
            <div className='w-full min-h-8 h-8 flex items-center justify-start space-x-2'>
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
                hoverContent={
                  <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md'>
                    Back
                  </div>
                }
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
                      className={`aspect-square h-full border-2 hover:border-fg-secondary rounded ${
                        activeBackground.current.categorySelection ===
                        categorySelection
                          ? "border-fg-secondary"
                          : "border-fg-white-75"
                      }`}
                      contentFunction={() => {
                        return (
                          <FgImage
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
                        <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
                          {categorySelectionData.label}
                        </div>
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
      initHeight='294px'
      minWidth={400}
      minHeight={294}
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
