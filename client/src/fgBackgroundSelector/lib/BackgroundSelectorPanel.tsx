import React, { useState } from "react";
import FgPanel from "../../fgElements/fgPanel/FgPanel";
import FgButton from "../../fgElements/fgButton/FgButton";
import FgImage from "../../fgElements/fgImage/FgImage";
import FgSVG from "../../fgElements/fgSVG/FgSVG";

import ChristmasIcon from "../../../public/svgs/christmasIcon.svg";
import geometricIcon from "../../../public/svgs/christmasIcon.svg";
import natureIcon from "../../../public/svgs/christmasIcon.svg";
import spaceIcon from "../../../public/svgs/christmasIcon.svg";
import technologyIcon from "../../../public/svgs/christmasIcon.svg";

import whiteChristmas from "../../../public/backgroundImages/christmas/whiteChristmas.png";
import geometric1 from "../../../public/backgroundImages/geometric/geometric1.png";
import geometric2 from "../../../public/backgroundImages/geometric/geometric2.png";
import geometric3 from "../../../public/backgroundImages/geometric/geometric3.png";
import geometric4 from "../../../public/backgroundImages/geometric/geometric4.png";
import geometric5 from "../../../public/backgroundImages/geometric/geometric5.png";
import geometric6 from "../../../public/backgroundImages/geometric/geometric6.png";
import birds from "../../../public/backgroundImages/nature/birds.png";
import cave from "../../../public/backgroundImages/nature/cave.png";
import clearing from "../../../public/backgroundImages/nature/clearing.png";
import flowering from "../../../public/backgroundImages/nature/flowering.png";
import fungus from "../../../public/backgroundImages/nature/fungus.png";
import mountains from "../../../public/backgroundImages/nature/mountains.png";
import rollingHills from "../../../public/backgroundImages/nature/rollingHills.png";
import shoreSide from "../../../public/backgroundImages/nature/shoreSide.png";
import sprouting from "../../../public/backgroundImages/nature/sprouting.png";
import submarine from "../../../public/backgroundImages/nature/submarine.png";
import sunnySideUp from "../../../public/backgroundImages/nature/sunnySideUp.png";
import bigDipper from "../../../public/backgroundImages/space/bigDipper.png";
import blueBall from "../../../public/backgroundImages/space/blueBall.png";
import overTheMoon from "../../../public/backgroundImages/space/overTheMoon.png";
import rocket from "../../../public/backgroundImages/space/rocket.png";
import solarParty from "../../../public/backgroundImages/space/solarParty.png";
import starMap from "../../../public/backgroundImages/space/starMap.png";
import binary from "../../../public/backgroundImages/technology/binary.png";
import calculator from "../../../public/backgroundImages/technology/calculator.png";
import circuit from "../../../public/backgroundImages/technology/circuit.png";
import robot from "../../../public/backgroundImages/technology/robot.png";
import technology1 from "../../../public/backgroundImages/technology/technology1.png";
import technology2 from "../../../public/backgroundImages/technology/technology2.png";
import WWW from "../../../public/backgroundImages/technology/WWW.png";

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
    | TechnologyCategories]?: { label: string; url: string };
} = {
  geometric4: { label: "Geometric 4", url: geometric4 },
  geometric6: { label: "Geometric 6", url: geometric6 },
  mountains: { label: "Mountains", url: mountains },
  shoreSide: { label: "Shore side", url: shoreSide },
  submarine: { label: "Submarine", url: submarine },
  sunnySideUp: { label: "Sunny side up", url: sunnySideUp },
  blueBall: { label: "Blue ball", url: blueBall },
  solarParty: { label: "Solar party", url: solarParty },
  starMap: { label: "Star map", url: starMap },
  binary: { label: "Binary", url: binary },
  circuit: { label: "Calculator", url: circuit },
  robot: { label: "Robot", url: robot },
};

const categories: {
  christmas: {
    [christmasCategory in ChristmasCategories]: { label: string; url: string };
  };
  geometric: {
    [geometricCategory in GeometricCategories]: { label: string; url: string };
  };
  nature: {
    [natureCategory in NatureCategories]: { label: string; url: string };
  };
  space: {
    [spaceCategory in SpaceCategories]: { label: string; url: string };
  };
  technology: {
    [technologyCategory in TechnologyCategories]: {
      label: string;
      url: string;
    };
  };
} = {
  christmas: {
    whiteChristmas: { label: "White christmas", url: whiteChristmas },
  },
  geometric: {
    geometric1: { label: "Geometric 1", url: geometric1 },
    geometric2: { label: "Geometric 2", url: geometric2 },
    geometric3: { label: "Geometric 3", url: geometric3 },
    geometric4: { label: "Geometric 4", url: geometric4 },
    geometric5: { label: "Geometric 5", url: geometric5 },
    geometric6: { label: "Geometric 6", url: geometric6 },
  },
  nature: {
    birds: { label: "Birds", url: birds },
    cave: { label: "Cave", url: cave },
    clearing: { label: "Clearing", url: clearing },
    flowering: { label: "Flowering", url: flowering },
    fungus: { label: "Fungus", url: fungus },
    mountains: { label: "Mountains", url: mountains },
    rollingHills: { label: "Rolling hills", url: rollingHills },
    shoreSide: { label: "Shore side", url: shoreSide },
    sprouting: { label: "Sprouting", url: sprouting },
    submarine: { label: "Submarine", url: submarine },
    sunnySideUp: { label: "Sunny side up", url: sunnySideUp },
  },
  space: {
    bigDipper: { label: "Big dipper", url: bigDipper },
    blueBall: { label: "Blue ball", url: blueBall },
    overTheMoon: { label: "Over the moon", url: overTheMoon },
    rocket: { label: "Rocket", url: rocket },
    solarParty: { label: "Solar party", url: solarParty },
    starMap: { label: "Star map", url: starMap },
  },
  technology: {
    binary: { label: "Binary", url: binary },
    calculator: { label: "Calculator", url: calculator },
    circuit: { label: "Calculator", url: circuit },
    robot: { label: "Robot", url: robot },
    technology1: { label: "Technology 1", url: technology1 },
    technology2: { label: "Technology 2", url: technology2 },
    WWW: { label: "World Wide Web", url: WWW },
  },
};

export default function BackgroundSelectorPanel({
  setActive,
  backgroundSelectorBtnRef,
}: {
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  backgroundSelectorBtnRef: React.RefObject<HTMLButtonElement>;
}) {
  const [category, setCategory] = useState(false);

  return (
    <FgPanel
      content={
        <div className='w-full h-full flex flex-col items-center justify-center'>
          <div className='w-full h-1/6 max-h-10 py-2'>
            <FgButton
              className='aspect-square'
              style={{ height: "calc(100% - 1rem)" }}
            />
          </div>
          <div className='w-full h-1/6 max-h-10 py-2'>
            {Object.entries(recommendations).map(
              ([recommendationName, recommendation]) => {
                return (
                  <FgButton
                    key={recommendationName}
                    contentFunction={() => {
                      return (
                        <FgImage
                          src={recommendation.url}
                          srcLoading={recommendation.loadingUrl}
                        />
                      );
                    }}
                  />
                );
              }
            )}
          </div>
          <div className='w-full grow'>
            {Object.entries(categoriesMetadata).map(
              ([categoryName, categoryMetadata]) => {
                return (
                  <FgButton
                    key={categoryName}
                    contentFunction={() => {
                      return <FgSVG src={categoryMetadata.url} />;
                    }}
                  />
                );
              }
            )}
          </div>
        </div>
      }
      closePosition={"topRight"}
      closeCallback={() => setActive((prev) => !prev)}
      initPosition={{
        referenceElement: backgroundSelectorBtnRef as unknown as HTMLElement,
        placement: "below",
        padding: 4,
      }}
    />
  );
}
