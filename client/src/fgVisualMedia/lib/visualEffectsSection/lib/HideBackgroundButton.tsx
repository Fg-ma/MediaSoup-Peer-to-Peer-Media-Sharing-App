import React, { useRef, useState, Suspense } from "react";
import { useMediaContext } from "../../../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import {
  HideBackgroundEffectTypes,
  PostProcessEffects,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import FgButton from "../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../fgElements/fgSVG/FgSVG";
import FgImage from "../../../../fgElements/fgImage/FgImage";
import FgHoverContentStandard from "../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";

const ColorPicker = React.lazy(() => import("./ColorPicker"));

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const hideBackgroundIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/hideBackgroundIcon.svg";
const hideBackgroundOffIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/hideBackgroundOffIcon.svg";

const beachBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/beach_640x427.jpg";
const beachBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/beach_64x43.jpg";
const brickWallBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/brickWall_640x427.jpg";
const brickWallBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/brickWall_64x43.jpg";
const butterfliesBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/butterflies_640x360.jpg";
const butterfliesBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/butterflies_64x36.jpg";
const cafeBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/cafe_427x640.jpg";
const cafeBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/cafe_43x64.jpg";
const chalkBoardBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/chalkBoard_640x427.jpg";
const chalkBoardBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/chalkBoard_64x43.jpg";
const citySkylineBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/citySkyline_640x331.jpg";
const citySkylineBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/citySkyline_64x33.jpg";
const cliffPalaceBackground =
  nginxAssetSeverBaseUrl +
  "videoBackgrounds/cliffPalaceMesaVerdeNationalParkByAnselAdams_608x750.jpg";
const cliffPalaceBackgroundSmall =
  nginxAssetSeverBaseUrl +
  "videoBackgrounds/cliffPalaceMesaVerdeNationalParkByAnselAdams_52x64.jpg";
const eveningMcDonaldLakeBackground =
  nginxAssetSeverBaseUrl +
  "videoBackgrounds/eveningMcDonaldLakeGlacierNationalParkMontanaByAnselAdams_750x569.jpg";
const eveningMcDonaldLakeBackgroundSmall =
  nginxAssetSeverBaseUrl +
  "videoBackgrounds/eveningMcDonaldLakeGlacierNationalParkMontanaByAnselAdams_64x49.jpg";
const forestBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/forest_640x427.jpg";
const forestBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/forest_64x43.jpg";
const halfDomeAppleOrchardBackground =
  nginxAssetSeverBaseUrl +
  "videoBackgrounds/halfDomeAppleOrchardYosemiteCaliforniaByAnselAdams_750x575.jpg";
const halfDomeAppleOrchardBackgroundSmall =
  nginxAssetSeverBaseUrl +
  "videoBackgrounds/halfDomeAppleOrchardYosemiteCaliforniaByAnselAdams_64x49.jpg";
const lakeBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/lake_640x457.jpg";
const lakeBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/lake_64x46.jpg";
const libraryBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/library_640x427.jpg";
const libraryBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/library_64x43.jpg";
const milkyWayBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/milkyWay_640x349.jpg";
const milkyWayBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/milkyWay_64x35.jpg";
const mountainsBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/mountains_640x425.jpg";
const mountainsBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/mountains_64x43.jpg";
const oceanBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/ocean_640x427.jpg";
const oceanBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/ocean_64x43.jpg";
const oldFaithfulGeyserBackground =
  nginxAssetSeverBaseUrl +
  "videoBackgrounds/oldFaithfulGeyserYellowstoneNationalParkWyomingByAnselAdams_532x750.jpg";
const oldFaithfulGeyserBackgroundSmall =
  nginxAssetSeverBaseUrl +
  "videoBackgrounds/oldFaithfulGeyserYellowstoneNationalParkWyomingByAnselAdams_45x64.jpg";
const railroadBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/railroad_640x414.jpg";
const railroadBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/railroad_64x41.jpg";
const rollingHillsBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/rollingHills_640x417.jpg";
const rollingHillsBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/rollingHills_64x42.jpg";
const seaSideHousesBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/seaSideHouses_640x390.jpg";
const seaSideHousesBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/seaSideHouses_64x39.jpg";
const snowCoveredMoutainsBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/snowCoveredMoutains_640x360.jpg";
const snowCoveredMoutainsBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/snowCoveredMoutains_64x36.jpg";
const sunflowersBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/sunflowers_640x427.jpg";
const sunflowersBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/sunflowers_64x43.jpg";
const sunsetBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/sunset_640x427.jpg";
const sunsetBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/sunset_64x43.jpg";
const treesBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/trees_640x426.jpg";
const treesBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/trees_64x43.jpg";
const windingRoadBackground =
  nginxAssetSeverBaseUrl + "videoBackgrounds/windingRoad_640x427.jpg";
const windingRoadBackgroundSmall =
  nginxAssetSeverBaseUrl + "videoBackgrounds/windingRoad_64x43.jpg";

const hideBackgroundLabels: {
  [hideBackgroundEffectType in HideBackgroundEffectTypes]: string;
} = {
  color: "Solid color",
  beach: "Beach",
  brickWall: "Brick wall",
  butterflies: "Neon butterflies",
  cafe: "Cafe",
  chalkBoard: "Chalk board",
  citySkyline: "City skyline",
  cliffPalace: "Cliff Palace by Ansel Adams",
  eveningMcDonaldLake: "Evening McDonald Lake by Ansel Adams",
  forest: "Forest",
  halfDomeAppleOrchard: "Half Dome Apple Orchard by Ansel Adams",
  lake: "Lake",
  library: "Library",
  milkyWay: "Milky Way",
  mountains: "Mountains",
  ocean: "Ocean",
  oldFaithfulGeyser: "Old Faithful Geyser by Ansel Adams",
  railroad: "Railroad",
  rollingHills: "Rolling hills",
  seaSideHouses: "Sea side house",
  snowCoveredMoutains: "Snow covered mountains",
  sunflowers: "Sunflowers",
  sunset: "Sunset",
  trees: "Trees",
  windingRoad: "Winding road",
};

export default function HideBackgroundButton({
  username,
  instance,
  type,
  visualMediaId,
  isUser,
  handleVisualEffectChange,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
}: {
  username: string;
  instance: string;
  type: "camera";
  visualMediaId: string;
  isUser: boolean;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean,
    hideBackgroundStyle?: HideBackgroundEffectTypes,
    hideBackgroundColor?: string,
    postProcessStyle?: PostProcessEffects
  ) => Promise<void>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();
  const {
    userEffectsStyles,
    remoteEffectsStyles,
    userStreamEffects,
    remoteStreamEffects,
  } = useEffectsContext();

  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [color, setColor] = useState("#F56114");
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const [_, setRerender] = useState(0);
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);
  const hideBackgroundContainerRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef("#F56114");

  const streamEffects = isUser
    ? userStreamEffects.current.camera[visualMediaId].hideBackground
    : remoteStreamEffects.current[username][instance].camera[visualMediaId]
        .hideBackground;
  const effectsStyles = isUser
    ? userEffectsStyles.current[type][visualMediaId].hideBackground
    : remoteEffectsStyles.current[username][instance][type][visualMediaId]
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
    citySkyline: {
      image: citySkylineBackground,
      imageSmall: citySkylineBackgroundSmall,
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

    if (isUser) {
      userMedia.current.camera[
        visualMediaId
      ].babylonScene.babylonRenderLoop.swapHideBackgroundEffectImage(
        effectsStyles.style
      );
    }

    await handleVisualEffectChange(
      "hideBackground",
      false,
      effectsStyles.style
    );

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.visualEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .visualEffectsButtonValue as HideBackgroundEffectTypes;

    if (effectsStyles.style !== effectType || !streamEffects) {
      effectsStyles.style = effectType;
      if (isUser) {
        userMedia.current.camera[
          visualMediaId
        ].babylonScene.babylonRenderLoop.swapHideBackgroundEffectImage(
          effectType
        );
      }

      await handleVisualEffectChange(
        "hideBackground",
        streamEffects,
        effectType,
        undefined
      );
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  const handleAcceptColorCallback = async () => {
    setEffectsDisabled(true);

    if (isUser) {
      userMedia.current.camera[
        visualMediaId
      ].babylonScene.babylonRenderLoop.swapHideBackgroundContextFillColor(
        colorRef.current
      );
    }

    if (effectsStyles.style !== "color" || !streamEffects) {
      effectsStyles.style = "color";
      effectsStyles.color = colorRef.current;

      await handleVisualEffectChange(
        "hideBackground",
        streamEffects,
        undefined,
        colorRef.current
      );
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
          <FgHoverContentStandard
            content={streamEffects ? "Reveal background" : "Hide background"}
          />
        }
        holdFunction={holdFunction}
        holdContent={
          <div
            ref={hideBackgroundContainerRef}
            className='overflow-y-auto small-vertical-scroll-bar max-h-48 mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'
          >
            <div className='w-full h-full flex items-center justify-center'>
              <div
                className='border-3 border-white border-opacity-75 rounded'
                style={{
                  backgroundColor: colorRef.current,
                  width: "100%",
                  height: "100%",
                }}
                onClick={(event) => {
                  holdFunction(event as unknown as PointerEvent);
                }}
                data-visual-effects-button-value={"color"}
              ></div>
            </div>
            {Object.entries(backgroundChoices).map(([background, choice]) => (
              <FgButton
                key={background}
                contentFunction={() => (
                  <div
                    className={`${
                      background === effectsStyles.style
                        ? "border-fg-secondary border-3 border-opacity-100"
                        : ""
                    } border-white flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                    onClick={(event) => {
                      holdFunction(event as unknown as PointerEvent);
                    }}
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
                )}
                hoverContent={
                  <FgHoverContentStandard
                    content={
                      hideBackgroundLabels[
                        background as HideBackgroundEffectTypes
                      ]
                    }
                  />
                }
                scrollingContainerRef={hideBackgroundContainerRef}
                options={{
                  hoverZValue: 999999999999999,
                  hoverTimeoutDuration: 750,
                }}
              />
            ))}
          </div>
        }
        closeHoldToggle={closeHoldToggle}
        setCloseHoldToggle={setCloseHoldToggle}
        scrollingContainerRef={scrollingContainerRef}
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
          hoverContent={<FgHoverContentStandard content='Color picker' />}
          scrollingContainerRef={scrollingContainerRef}
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
              color={color}
              setColor={setColor}
              tempColor={tempColor}
              setTempColor={setTempColor}
              setIsColorPicker={setIsColorPicker}
              colorRef={colorRef}
              colorPickerBtnRef={colorPickerBtnRef}
              handleAcceptColorCallback={handleAcceptColorCallback}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
