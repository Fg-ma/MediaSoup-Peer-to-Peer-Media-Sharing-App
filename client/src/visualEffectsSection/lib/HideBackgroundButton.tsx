import React, { useRef, useState, Suspense } from "react";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";
import {
  HideBackgroundEffectTypes,
  useCurrentEffectsStylesContext,
} from "../../context/CurrentEffectsStylesContext";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgImage from "../../fgImage/FgImage";

const ColorPicker = React.lazy(() => import("./ColorPicker"));

import hideBackgroundIcon from "../../../public/svgs/visualEffects/hideBackgroundIcon.svg";
import hideBackgroundOffIcon from "../../../public/svgs/visualEffects/hideBackgroundOffIcon.svg";

import beachBackground from "../../../public/videoBackgrounds/beach_640x427.jpg";
import beachBackgroundSmall from "../../../public/videoBackgrounds/beach_64x43.jpg";
import brickWallBackground from "../../../public/videoBackgrounds/brickWall_640x427.jpg";
import brickWallBackgroundSmall from "../../../public/videoBackgrounds/brickWall_64x43.jpg";
import butterfliesBackground from "../../../public/videoBackgrounds/butterflies_640x360.jpg";
import butterfliesBackgroundSmall from "../../../public/videoBackgrounds/butterflies_64x36.jpg";
import cafeBackground from "../../../public/videoBackgrounds/cafe_427x640.jpg";
import cafeBackgroundSmall from "../../../public/videoBackgrounds/cafe_43x64.jpg";
import chalkBoardBackground from "../../../public/videoBackgrounds/chalkBoard_640x427.jpg";
import chalkBoardBackgroundSmall from "../../../public/videoBackgrounds/chalkBoard_64x43.jpg";
import citySkyLineBackground from "../../../public/videoBackgrounds/citySkyLine_640x331.jpg";
import citySkyLineBackgroundSmall from "../../../public/videoBackgrounds/citySkyLine_64x33.jpg";
import cliffPalaceBackground from "../../../public/videoBackgrounds/cliffPalaceMesaVerdeNationalParkByAnselAdams_608x750.jpg";
import cliffPalaceBackgroundSmall from "../../../public/videoBackgrounds/cliffPalaceMesaVerdeNationalParkByAnselAdams_52x64.jpg";
import eveningMcDonaldLakeBackground from "../../../public/videoBackgrounds/eveningMcDonaldLakeGlacierNationalParkMontanaByAnselAdams_750x569.jpg";
import eveningMcDonaldLakeBackgroundSmall from "../../../public/videoBackgrounds/eveningMcDonaldLakeGlacierNationalParkMontanaByAnselAdams_64x49.jpg";
import forestBackground from "../../../public/videoBackgrounds/forest_640x427.jpg";
import forestBackgroundSmall from "../../../public/videoBackgrounds/forest_64x43.jpg";
import halfDomeAppleOrchardBackground from "../../../public/videoBackgrounds/halfDomeAppleOrchardYosemiteCaliforniaByAnselAdams_750x575.jpg";
import halfDomeAppleOrchardBackgroundSmall from "../../../public/videoBackgrounds/halfDomeAppleOrchardYosemiteCaliforniaByAnselAdams_64x49.jpg";
import lakeBackground from "../../../public/videoBackgrounds/lake_640x457.jpg";
import lakeBackgroundSmall from "../../../public/videoBackgrounds/lake_64x46.jpg";
import libraryBackground from "../../../public/videoBackgrounds/library_640x427.jpg";
import libraryBackgroundSmall from "../../../public/videoBackgrounds/library_64x43.jpg";
import milkyWayBackground from "../../../public/videoBackgrounds/milkyWay_640x349.jpg";
import milkyWayBackgroundSmall from "../../../public/videoBackgrounds/milkyWay_64x35.jpg";
import mountainsBackground from "../../../public/videoBackgrounds/mountains_640x425.jpg";
import mountainsBackgroundSmall from "../../../public/videoBackgrounds/mountains_64x43.jpg";
import oceanBackground from "../../../public/videoBackgrounds/ocean_640x427.jpg";
import oceanBackgroundSmall from "../../../public/videoBackgrounds/ocean_64x43.jpg";
import oldFaithfulGeyserBackground from "../../../public/videoBackgrounds/oldFaithfulGeyserYellowstoneNationalParkWyomingByAnselAdams_532x750.jpg";
import oldFaithfulGeyserBackgroundSmall from "../../../public/videoBackgrounds/oldFaithfulGeyserYellowstoneNationalParkWyomingByAnselAdams_45x64.jpg";
import railroadBackground from "../../../public/videoBackgrounds/railroad_640x414.jpg";
import railroadBackgroundSmall from "../../../public/videoBackgrounds/railroad_64x41.jpg";
import rollingHillsBackground from "../../../public/videoBackgrounds/rollingHills_640x417.jpg";
import rollingHillsBackgroundSmall from "../../../public/videoBackgrounds/rollingHills_64x42.jpg";
import seaSideHousesBackground from "../../../public/videoBackgrounds/seaSideHouses_640x390.jpg";
import seaSideHousesBackgroundSmall from "../../../public/videoBackgrounds/seaSideHouses_64x39.jpg";
import snowCoveredMoutainsBackground from "../../../public/videoBackgrounds/snowCoveredMoutains_640x360.jpg";
import snowCoveredMoutainsBackgroundSmall from "../../../public/videoBackgrounds/snowCoveredMoutains_64x36.jpg";
import sunflowersBackground from "../../../public/videoBackgrounds/sunflowers_640x427.jpg";
import sunflowersBackgroundSmall from "../../../public/videoBackgrounds/sunflowers_64x43.jpg";
import sunsetBackground from "../../../public/videoBackgrounds/sunset_640x427.jpg";
import sunsetBackgroundSmall from "../../../public/videoBackgrounds/sunset_64x43.jpg";
import treesBackground from "../../../public/videoBackgrounds/trees_640x426.jpg";
import treesBackgroundSmall from "../../../public/videoBackgrounds/trees_64x43.jpg";
import windingRoadBackground from "../../../public/videoBackgrounds/windingRoad_640x427.jpg";
import windingRoadBackgroundSmall from "../../../public/videoBackgrounds/windingRoad_64x43.jpg";

export default function HideBackgroundButton({
  username,
  instance,
  type,
  videoId,
  isUser,
  handleVisualEffectChange,
  effectsDisabled,
  setEffectsDisabled,
}: {
  username: string;
  instance: string;
  type: "camera";
  videoId: string;
  isUser: boolean;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userMedia, userStreamEffects, remoteStreamEffects } =
    useStreamsContext();
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();

  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [color, setColor] = useState("#F56114");
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);
  const colorRef = useRef("#F56114");
  const [rerender, setRerender] = useState(0);

  const streamEffects = isUser
    ? userStreamEffects.current.camera[videoId].hideBackground
    : remoteStreamEffects.current[username][instance].camera[videoId]
        .hideBackground;
  const effectsStyles = isUser
    ? currentEffectsStyles.current[type][videoId].hideBackground
    : remoteCurrentEffectsStyles.current[username][instance][type][videoId]
        .hideBackground;

  const backgroundChoices: {
    [hideBackgroundEffect in HideBackgroundEffectTypes]?: {
      image: string;
      imageSmall: string;
    };
  } = {
    beach: { image: beachBackground, imageSmall: beachBackgroundSmall },
    brickWall: {
      image: brickWallBackground,
      imageSmall: brickWallBackgroundSmall,
    },
    butterflies: {
      image: butterfliesBackground,
      imageSmall: butterfliesBackgroundSmall,
    },
    cafe: { image: cafeBackground, imageSmall: cafeBackgroundSmall },
    chalkBoard: {
      image: chalkBoardBackground,
      imageSmall: chalkBoardBackgroundSmall,
    },
    citySkyLine: {
      image: citySkyLineBackground,
      imageSmall: citySkyLineBackgroundSmall,
    },
    cliffPalace: {
      image: cliffPalaceBackground,
      imageSmall: cliffPalaceBackgroundSmall,
    },
    eveningMcDonaldLake: {
      image: eveningMcDonaldLakeBackground,
      imageSmall: eveningMcDonaldLakeBackgroundSmall,
    },
    forest: { image: forestBackground, imageSmall: forestBackgroundSmall },
    halfDomeAppleOrchard: {
      image: halfDomeAppleOrchardBackground,
      imageSmall: halfDomeAppleOrchardBackgroundSmall,
    },
    lake: { image: lakeBackground, imageSmall: lakeBackgroundSmall },
    library: { image: libraryBackground, imageSmall: libraryBackgroundSmall },
    milkyWay: {
      image: milkyWayBackground,
      imageSmall: milkyWayBackgroundSmall,
    },
    mountains: {
      image: mountainsBackground,
      imageSmall: mountainsBackgroundSmall,
    },
    ocean: { image: oceanBackground, imageSmall: oceanBackgroundSmall },
    oldFaithfulGeyser: {
      image: oldFaithfulGeyserBackground,
      imageSmall: oldFaithfulGeyserBackgroundSmall,
    },
    railroad: {
      image: railroadBackground,
      imageSmall: railroadBackgroundSmall,
    },
    rollingHills: {
      image: rollingHillsBackground,
      imageSmall: rollingHillsBackgroundSmall,
    },
    seaSideHouses: {
      image: seaSideHousesBackground,
      imageSmall: seaSideHousesBackgroundSmall,
    },
    snowCoveredMoutains: {
      image: snowCoveredMoutainsBackground,
      imageSmall: snowCoveredMoutainsBackgroundSmall,
    },
    sunflowers: {
      image: sunflowersBackground,
      imageSmall: sunflowersBackgroundSmall,
    },
    sunset: { image: sunsetBackground, imageSmall: sunsetBackgroundSmall },
    trees: { image: treesBackground, imageSmall: treesBackgroundSmall },
    windingRoad: {
      image: windingRoadBackground,
      imageSmall: windingRoadBackgroundSmall,
    },
  };

  const handleColorPicker = () => {
    setTempColor(colorRef.current);
    setIsColorPicker((prev) => !prev);
  };

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => prev + 1);

    userMedia.current.camera[videoId].render.swapHideBackgroundEffectImage(
      effectsStyles.style
    );

    await handleVisualEffectChange("hideBackground");

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: React.MouseEvent<Element, MouseEvent>) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.visualEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .visualEffectsButtonValue as HideBackgroundEffectTypes;
    if (
      effectType in backgroundChoices &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      effectsStyles.style = effectType;
      userMedia.current.camera[videoId].render.swapHideBackgroundEffectImage(
        effectType
      );

      await handleVisualEffectChange("hideBackground", streamEffects);
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  const handleAcceptColorCallback = async () => {
    setEffectsDisabled(true);

    userMedia.current.camera[videoId].render.swapHideBackgroundContextFillColor(
      colorRef.current
    );

    if (effectsStyles.style !== "color" || !streamEffects) {
      effectsStyles.style = "color";
      effectsStyles.color = colorRef.current;

      await handleVisualEffectChange("hideBackground", streamEffects);
    }

    setEffectsDisabled(false);
  };

  return (
    <div className='w-max flex items-center justify-center'>
      <FgButton
        clickFunction={clickFunction}
        contentFunction={() => {
          return (
            <FgSVG
              src={streamEffects ? hideBackgroundOffIcon : hideBackgroundIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: "white" },
              ]}
            />
          );
        }}
        hoverContent={
          <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            {streamEffects ? "Reveal background" : "Hide background"}
          </div>
        }
        holdFunction={holdFunction}
        holdContent={
          <div className='overflow-y-auto smallScrollbar max-h-48 mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
            {Object.entries(backgroundChoices).map(([background, choice]) => (
              <div
                key={background}
                className={`${
                  background === effectsStyles.style
                    ? "border-fg-secondary border-3 border-opacity-100"
                    : ""
                } border-white flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                onClick={holdFunction}
                data-visual-effects-button-value={background}
              >
                <FgImage
                  src={choice.image}
                  srcLoading={choice.imageSmall}
                  alt={background}
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    objectFit: "contain",
                  }}
                  data-visual-effects-button-value={background}
                />
              </div>
            ))}
          </div>
        }
        closeHoldToggle={closeHoldToggle}
        setCloseHoldToggle={setCloseHoldToggle}
        className='flex items-center justify-center min-w-10 w-10 aspect-square'
        options={{
          defaultDataValue: effectsStyles?.style,
          hoverTimeoutDuration: 750,
          disabled: effectsDisabled,
          holdKind: "toggle",
        }}
      />
      <div className='flex items-center justify-center min-w-10 w-10 aspect-square'>
        <FgButton
          externalRef={colorPickerBtnRef}
          clickFunction={() => handleColorPicker()}
          hoverContent={
            <div className='mb-6 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
              Color picker
            </div>
          }
          className='w-6 h-6 m-2 border border-white rounded'
          style={{ backgroundColor: tempColor }}
          options={{
            hoverTimeoutDuration: 750,
            disabled: effectsDisabled,
          }}
        />
        {isColorPicker && (
          <Suspense fallback={<div>Loading...</div>}>
            <ColorPicker
              username={username}
              instance={instance}
              type={type}
              videoId={videoId}
              isUser={isUser}
              color={color}
              setColor={setColor}
              tempColor={tempColor}
              setTempColor={setTempColor}
              setIsColorPicker={setIsColorPicker}
              colorRef={colorRef}
              colorPickerBtnRef={colorPickerBtnRef}
              handleVisualEffectChange={handleVisualEffectChange}
              handleAcceptColorCallback={handleAcceptColorCallback}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
