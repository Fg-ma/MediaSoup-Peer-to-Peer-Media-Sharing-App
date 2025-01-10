import React, { useRef, useState } from "react";
import { useEffectsContext } from "../../../../../context/effectsContext/EffectsContext";
import {
  MasksEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../../context/effectsContext/typeConstant";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgImageElement from "../../../../../fgElements/fgImageElement/FgImageElement";
import FgHoverContentStandard from "../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVideoController from "../../fgLowerVideoControls/lib/FgLowerVideoController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const baseMask_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/baseMask/baseMask_512x512.png";
const baseMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/baseMask/baseMask_32x32.png";
const baseMaskIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/masks/baseMask/baseMaskIcon.svg";
const baseMaskOffIcon =
  nginxAssetSeverBaseUrl +
  "svgs/visualEffects/masks/baseMask/baseMaskOffIcon.svg";
const alienMask_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/alienMask/alienMask_512x512.png";
const alienMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/alienMask/alienMask_32x32.png";
const alienMask_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/alienMask/alienMask_off_512x512.png";
const alienMask_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/alienMask/alienMask_off_32x32.png";
const clownMask_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/clownMask/clownMask_512x512.png";
const clownMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/clownMask/clownMask_32x32.png";
const clownMask_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/clownMask/clownMask_off_512x512.png";
const clownMask_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/clownMask/clownMask_off_32x32.png";
const creatureMask_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/creatureMask/creatureMask_512x512.png";
const creatureMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/creatureMask/creatureMask_32x32.png";
const creatureMask_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/creatureMask/creatureMask_off_512x512.png";
const creatureMask_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/creatureMask/creatureMask_off_32x32.png";
const cyberMask_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/cyberMask/cyberMask_512x512.png";
const cyberMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/cyberMask/cyberMask_32x32.png";
const cyberMask_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/cyberMask/cyberMask_off_512x512.png";
const cyberMask_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/cyberMask/cyberMask_off_32x32.png";
const darkKnightMask_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/darkKnightMask/darkKnightMask_512x512.png";
const darkKnightMask_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/darkKnightMask/darkKnightMask_32x32.png";
const darkKnightMask_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/darkKnightMask/darkKnightMask_off_512x512.png";
const darkKnightMask_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/darkKnightMask/darkKnightMask_off_32x32.png";
const demonMask_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/demonMask/demonMask_512x512.png";
const demonMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/demonMask/demonMask_32x32.png";
const demonMask_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/demonMask/demonMask_off_512x512.png";
const demonMask_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/demonMask/demonMask_off_32x32.png";
const gasMask1_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask1/gasMask1_512x512.png";
const gasMask1_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask1/gasMask1_32x32.png";
const gasMask1_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask1/gasMask1_off_512x512.png";
const gasMask1_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask1/gasMask1_off_32x32.png";
const gasMask2_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask2/gasMask2_512x512.png";
const gasMask2_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask2/gasMask2_32x32.png";
const gasMask2_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask2/gasMask2_off_512x512.png";
const gasMask2_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask2/gasMask2_off_32x32.png";
const gasMask3_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask3/gasMask3_512x512.png";
const gasMask3_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask3/gasMask3_32x32.png";
const gasMask3_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask3/gasMask3_off_512x512.png";
const gasMask3_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask3/gasMask3_off_32x32.png";
const gasMask4_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask4/gasMask4_512x512.png";
const gasMask4_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask4/gasMask4_32x32.png";
const gasMask4_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask4/gasMask4_off_512x512.png";
const gasMask4_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/gasMask4/gasMask4_off_32x32.png";
const masqueradeMask_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/masqueradeMask/masqueradeMask_512x512.png";
const masqueradeMask_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/masqueradeMask/masqueradeMask_32x32.png";
const masqueradeMask_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/masqueradeMask/masqueradeMask_off_512x512.png";
const masqueradeMask_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/masqueradeMask/masqueradeMask_off_32x32.png";
const metalManMask_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/metalManMask/metalManMask_512x512.png";
const metalManMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/metalManMask/metalManMask_32x32.png";
const metalManMask_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/metalManMask/metalManMask_off_512x512.png";
const metalManMask_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/metalManMask/metalManMask_off_32x32.png";
const oniMask_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/oniMask/oniMask_512x512.png";
const oniMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/oniMask/oniMask_32x32.png";
const oniMask_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/oniMask/oniMask_off_512x512.png";
const oniMask_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/oniMask/oniMask_off_32x32.png";
const plagueDoctorMask_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/plagueDoctorMask/plagueDoctorMask_512x512.png";
const plagueDoctorMask_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/plagueDoctorMask/plagueDoctorMask_32x32.png";
const plagueDoctorMask_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/plagueDoctorMask/plagueDoctorMask_off_512x512.png";
const plagueDoctorMask_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/plagueDoctorMask/plagueDoctorMask_off_32x32.png";
const sixEyesMask_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/sixEyesMask/sixEyesMask_512x512.png";
const sixEyesMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/sixEyesMask/sixEyesMask_32x32.png";
const sixEyesMask_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/sixEyesMask/sixEyesMask_off_512x512.png";
const sixEyesMask_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/sixEyesMask/sixEyesMask_off_32x32.png";
const tenguMask_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/tenguMask/tenguMask_512x512.png";
const tenguMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/tenguMask/tenguMask_32x32.png";
const tenguMask_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/tenguMask/tenguMask_off_512x512.png";
const tenguMask_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/tenguMask/tenguMask_off_32x32.png";
const threeFaceMask_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/threeFaceMask/threeFaceMask_512x512.png";
const threeFaceMask_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/threeFaceMask/threeFaceMask_32x32.png";
const threeFaceMask_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/threeFaceMask/threeFaceMask_off_512x512.png";
const threeFaceMask_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/threeFaceMask/threeFaceMask_off_32x32.png";
const weldingMask_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/weldingMask/weldingMask_512x512.png";
const weldingMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/weldingMask/weldingMask_32x32.png";
const weldingMask_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/weldingMask/weldingMask_off_512x512.png";
const weldingMask_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/weldingMask/weldingMask_off_32x32.png";
const woodlandMask_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/woodlandMask/woodlandMask_512x512.png";
const woodlandMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/woodlandMask/woodlandMask_32x32.png";
const woodlandMask_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/woodlandMask/woodlandMask_off_512x512.png";
const woodlandMask_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/woodlandMask/woodlandMask_off_32x32.png";
const woodPaintedMask_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/woodPaintedMask/woodPaintedMask_512x512.png";
const woodPaintedMask_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/woodPaintedMask/woodPaintedMask_32x32.png";
const woodPaintedMask_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/woodPaintedMask/woodPaintedMask_off_512x512.png";
const woodPaintedMask_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/woodPaintedMask/woodPaintedMask_off_32x32.png";
const zombieMask_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/zombieMask/zombieMask_512x512.png";
const zombieMask_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/zombieMask/zombieMask_32x32.png";
const zombieMask_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/masks/zombieMask/zombieMask_off_512x512.png";
const zombieMask_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/masks/zombieMask/zombieMask_off_32x32.png";

const masksLabels: {
  [masksEffectType in MasksEffectTypes]: string;
} = {
  baseMask: "Skin mask",
  alienMask: "Alien",
  clownMask: "Clown",
  creatureMask: "Creature",
  cyberMask: "Cyber",
  darkKnightMask: "Dark knight",
  demonMask: "Demon",
  gasMask1: "Gas mask 1",
  gasMask2: "Gas mask 2",
  gasMask3: "Gas mask 3",
  gasMask4: "Gas mask 4",
  masqueradeMask: "Masquerade",
  metalManMask: "Metal man",
  oniMask: "Oni",
  plagueDoctorMask: "Plague doctor",
  sixEyesMask: "Six eyes",
  tenguMask: "Tengu",
  threeFaceMask: "Three face",
  weldingMask: "Welding",
  woodlandMask: "Woodland",
  woodPaintedMask: "Wood painted",
  zombieMask: "Zombie",
};

export default function MasksButton({
  videoId,
  fgLowerVideoController,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
}: {
  videoId: string;
  fgLowerVideoController: FgLowerVideoController;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userEffectsStyles, userStreamEffects } = useEffectsContext();

  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [_, setRerender] = useState(false);
  const masksContainerRef = useRef<HTMLDivElement>(null);

  const streamEffects = userStreamEffects.current.video[videoId].video.masks;
  const effectsStyles = userEffectsStyles.current.video[videoId].video.masks;

  const masksEffects: {
    [key in MasksEffectTypes]: {
      image: string;
      imageSmall: string;
      icon?: string;
      iconOff?: string;
      imageOff?: string;
      imageOffSmall?: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    baseMask: {
      image: baseMask_512x512,
      imageSmall: baseMask_32x32,
      icon: baseMaskIcon,
      iconOff: baseMaskOffIcon,
      flipped: false,
      bgColor: "white",
    },
    alienMask: {
      image: alienMask_512x512,
      imageSmall: alienMask_32x32,
      imageOff: alienMask_off_512x512,
      imageOffSmall: alienMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    clownMask: {
      image: clownMask_512x512,
      imageSmall: clownMask_32x32,
      imageOff: clownMask_off_512x512,
      imageOffSmall: clownMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    creatureMask: {
      image: creatureMask_512x512,
      imageSmall: creatureMask_32x32,
      imageOff: creatureMask_off_512x512,
      imageOffSmall: creatureMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    cyberMask: {
      image: cyberMask_512x512,
      imageSmall: cyberMask_32x32,
      imageOff: cyberMask_off_512x512,
      imageOffSmall: cyberMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    darkKnightMask: {
      image: darkKnightMask_512x512,
      imageSmall: darkKnightMask_32x32,
      imageOff: darkKnightMask_off_512x512,
      imageOffSmall: darkKnightMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    demonMask: {
      image: demonMask_512x512,
      imageSmall: demonMask_32x32,
      imageOff: demonMask_off_512x512,
      imageOffSmall: demonMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    gasMask1: {
      image: gasMask1_512x512,
      imageSmall: gasMask1_32x32,
      imageOff: gasMask1_off_512x512,
      imageOffSmall: gasMask1_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    gasMask2: {
      image: gasMask2_512x512,
      imageSmall: gasMask2_32x32,
      imageOff: gasMask2_off_512x512,
      imageOffSmall: gasMask2_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    gasMask3: {
      image: gasMask3_512x512,
      imageSmall: gasMask3_32x32,
      imageOff: gasMask3_off_512x512,
      imageOffSmall: gasMask3_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    gasMask4: {
      image: gasMask4_512x512,
      imageSmall: gasMask4_32x32,
      imageOff: gasMask4_off_512x512,
      imageOffSmall: gasMask4_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    masqueradeMask: {
      image: masqueradeMask_512x512,
      imageSmall: masqueradeMask_32x32,
      imageOff: masqueradeMask_off_512x512,
      imageOffSmall: masqueradeMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    metalManMask: {
      image: metalManMask_512x512,
      imageSmall: metalManMask_32x32,
      imageOff: metalManMask_off_512x512,
      imageOffSmall: metalManMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    oniMask: {
      image: oniMask_512x512,
      imageSmall: oniMask_32x32,
      imageOff: oniMask_off_512x512,
      imageOffSmall: oniMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    plagueDoctorMask: {
      image: plagueDoctorMask_512x512,
      imageSmall: plagueDoctorMask_32x32,
      imageOff: plagueDoctorMask_off_512x512,
      imageOffSmall: plagueDoctorMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    sixEyesMask: {
      image: sixEyesMask_512x512,
      imageSmall: sixEyesMask_32x32,
      imageOff: sixEyesMask_off_512x512,
      imageOffSmall: sixEyesMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    tenguMask: {
      image: tenguMask_512x512,
      imageSmall: tenguMask_32x32,
      imageOff: tenguMask_off_512x512,
      imageOffSmall: tenguMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    threeFaceMask: {
      image: threeFaceMask_512x512,
      imageSmall: threeFaceMask_32x32,
      imageOff: threeFaceMask_off_512x512,
      imageOffSmall: threeFaceMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    weldingMask: {
      image: weldingMask_512x512,
      imageSmall: weldingMask_32x32,
      imageOff: weldingMask_off_512x512,
      imageOffSmall: weldingMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    woodlandMask: {
      image: woodlandMask_512x512,
      imageSmall: woodlandMask_32x32,
      imageOff: woodlandMask_off_512x512,
      imageOffSmall: woodlandMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    woodPaintedMask: {
      image: woodPaintedMask_512x512,
      imageSmall: woodPaintedMask_32x32,
      imageOff: woodPaintedMask_off_512x512,
      imageOffSmall: woodPaintedMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    zombieMask: {
      image: zombieMask_512x512,
      imageSmall: zombieMask_32x32,
      imageOff: zombieMask_off_512x512,
      imageOffSmall: zombieMask_off_32x32,
      flipped: false,
      bgColor: "white",
    },
  };

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => !prev);

    await fgLowerVideoController.handleVideoEffect("masks", false);

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.videoEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .videoEffectsButtonValue as MasksEffectTypes;
    if (
      effectType in masksEffects &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      effectsStyles.style = effectType;

      await fgLowerVideoController.handleVideoEffect("masks", streamEffects);
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  return (
    <FgButton
      clickFunction={clickFunction}
      holdFunction={holdFunction}
      contentFunction={() => {
        if (!effectsStyles) {
          return;
        }

        if (masksEffects[effectsStyles.style].icon) {
          const iconSrc =
            masksEffects[effectsStyles.style][
              streamEffects ? "iconOff" : "icon"
            ];

          if (iconSrc) {
            return (
              <FgSVG
                src={iconSrc}
                attributes={[
                  { key: "width", value: "95%" },
                  { key: "height", value: "95%" },
                ]}
                data-video-effects-button-value={effectsStyles.style}
              />
            );
          }
        } else {
          const imageSrc =
            masksEffects[effectsStyles.style][
              streamEffects ? "imageOff" : "image"
            ];

          const imageLoadingSrc =
            masksEffects[effectsStyles.style][
              streamEffects ? "imageOffSmall" : "imageSmall"
            ];

          if (imageSrc) {
            return (
              <FgImageElement
                src={imageSrc}
                srcLoading={imageLoadingSrc}
                alt={effectsStyles.style}
                style={{ width: "90%", height: "90%" }}
                data-video-effects-button-value={effectsStyles.style}
              />
            );
          }
        }
      }}
      holdContent={
        <div
          ref={masksContainerRef}
          className='overflow-y-auto small-vertical-scroll-bar max-h-48 mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'
        >
          {Object.entries(masksEffects).map(([mask, effect]) => (
            <FgButton
              key={mask}
              contentFunction={() => (
                <div
                  className={`${
                    mask === effectsStyles.style
                      ? "border-fg-secondary border-3 border-opacity-100"
                      : ""
                  } ${effect.flipped && "scale-x-[-1]"} ${
                    effect.bgColor === "white" && "bg-white border-fg-black-35"
                  } ${
                    effect.bgColor === "black" && "border-white"
                  } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                  onClick={(event) => {
                    holdFunction(event as unknown as PointerEvent);
                  }}
                  data-video-effects-button-value={mask}
                >
                  <FgImageElement
                    src={effect.image}
                    srcLoading={effect.imageSmall}
                    alt={mask}
                    style={{ width: "2.75rem", height: "2.75rem" }}
                    data-video-effects-button-value={mask}
                  />
                </div>
              )}
              hoverContent={
                <FgHoverContentStandard
                  content={masksLabels[mask as MasksEffectTypes]}
                />
              }
              scrollingContainerRef={masksContainerRef}
              options={{
                hoverZValue: 999999999999999,
                hoverTimeoutDuration: 750,
              }}
            />
          ))}
        </div>
      }
      hoverContent={<FgHoverContentStandard content='Masks' />}
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
  );
}
