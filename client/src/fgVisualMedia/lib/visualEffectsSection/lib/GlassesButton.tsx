import React, { useRef, useState } from "react";
import { useCurrentEffectsStylesContext } from "../../../../context/currentEffectsStylesContext/CurrentEffectsStylesContext";
import { useStreamsContext } from "../../../../context/streamsContext/StreamsContext";
import { GlassesEffectTypes } from "../../../../context/currentEffectsStylesContext/typeConstant";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../context/streamsContext/typeConstant";
import FgButton from "../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../fgElements/fgSVG/FgSVG";
import FgImage from "../../../../fgElements/fgImage/FgImage";

import defaultGlasses_512x512 from "../../../../../public/2DAssets/glasses/defaultGlasses/defaultGlasses_512x512.png";
import defaultGlasses_32x32 from "../../../../../public/2DAssets/glasses/defaultGlasses/defaultGlasses_32x32.png";
import defaultGlassesIcon from "../../../../../public/svgs/visualEffects/glasses/defaultGlasses/defaultGlassesIcon.svg";
import defaultGlassesOffIcon from "../../../../../public/svgs/visualEffects/glasses/defaultGlasses/defaultGlassesOffIcon.svg";
import AmericaGlasses_512x512 from "../../../../../public/2DAssets/glasses/AmericaGlasses/AmericaGlasses_512x512.png";
import AmericaGlasses_32x32 from "../../../../../public/2DAssets/glasses/AmericaGlasses/AmericaGlasses_32x32.png";
import AmericaGlassesIcon from "../../../../../public/svgs/visualEffects/glasses/AmericaGlasses/AmericaGlassesIcon.svg";
import AmericaGlassesOffIcon from "../../../../../public/svgs/visualEffects/glasses/AmericaGlasses/AmericaGlassesOffIcon.svg";
import aviatorGoggles_512x512 from "../../../../../public/2DAssets/glasses/aviatorGoggles/aviatorGoggles_512x512.png";
import aviatorGoggles_32x32 from "../../../../../public/2DAssets/glasses/aviatorGoggles/aviatorGoggles_32x32.png";
import aviatorGoggles_off_512x512 from "../../../../../public/2DAssets/glasses/aviatorGoggles/aviatorGoggles_off_512x512.png";
import aviatorGoggles_off_32x32 from "../../../../../public/2DAssets/glasses/aviatorGoggles/aviatorGoggles_off_32x32.png";
import bloodyGlasses_512x512 from "../../../../../public/2DAssets/glasses/bloodyGlasses/bloodyGlasses_512x512.png";
import bloodyGlasses_32x32 from "../../../../../public/2DAssets/glasses/bloodyGlasses/bloodyGlasses_32x32.png";
import bloodyGlasses_off_512x512 from "../../../../../public/2DAssets/glasses/bloodyGlasses/bloodyGlasses_off_512x512.png";
import bloodyGlasses_off_32x32 from "../../../../../public/2DAssets/glasses/bloodyGlasses/bloodyGlasses_off_32x32.png";
import eyeProtectionGlasses_512x512 from "../../../../../public/2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_512x512.png";
import eyeProtectionGlasses_32x32 from "../../../../../public/2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_32x32.png";
import eyeProtectionGlasses_off_512x512 from "../../../../../public/2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_off_512x512.png";
import eyeProtectionGlasses_off_32x32 from "../../../../../public/2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_off_32x32.png";
import glasses1_512x512 from "../../../../../public/2DAssets/glasses/glasses1/glasses1_512x512.png";
import glasses1_32x32 from "../../../../../public/2DAssets/glasses/glasses1/glasses1_32x32.png";
import glasses1_off_512x512 from "../../../../../public/2DAssets/glasses/glasses1/glasses1_off_512x512.png";
import glasses1_off_32x32 from "../../../../../public/2DAssets/glasses/glasses1/glasses1_off_32x32.png";
import glasses2_512x512 from "../../../../../public/2DAssets/glasses/glasses2/glasses2_512x512.png";
import glasses2_32x32 from "../../../../../public/2DAssets/glasses/glasses2/glasses2_32x32.png";
import glasses2_off_512x512 from "../../../../../public/2DAssets/glasses/glasses2/glasses2_off_512x512.png";
import glasses2_off_32x32 from "../../../../../public/2DAssets/glasses/glasses2/glasses2_off_32x32.png";
import glasses3_512x512 from "../../../../../public/2DAssets/glasses/glasses3/glasses3_512x512.png";
import glasses3_32x32 from "../../../../../public/2DAssets/glasses/glasses3/glasses3_32x32.png";
import glasses3_off_512x512 from "../../../../../public/2DAssets/glasses/glasses3/glasses3_off_512x512.png";
import glasses3_off_32x32 from "../../../../../public/2DAssets/glasses/glasses3/glasses3_off_32x32.png";
import glasses4_512x512 from "../../../../../public/2DAssets/glasses/glasses4/glasses4_512x512.png";
import glasses4_32x32 from "../../../../../public/2DAssets/glasses/glasses4/glasses4_32x32.png";
import glasses4_off_512x512 from "../../../../../public/2DAssets/glasses/glasses4/glasses4_off_512x512.png";
import glasses4_off_32x32 from "../../../../../public/2DAssets/glasses/glasses4/glasses4_off_32x32.png";
import glasses5_512x512 from "../../../../../public/2DAssets/glasses/glasses5/glasses5_512x512.png";
import glasses5_32x32 from "../../../../../public/2DAssets/glasses/glasses5/glasses5_32x32.png";
import glasses5_off_512x512 from "../../../../../public/2DAssets/glasses/glasses5/glasses5_off_512x512.png";
import glasses5_off_32x32 from "../../../../../public/2DAssets/glasses/glasses5/glasses5_off_32x32.png";
import glasses6_512x512 from "../../../../../public/2DAssets/glasses/glasses6/glasses6_512x512.png";
import glasses6_32x32 from "../../../../../public/2DAssets/glasses/glasses6/glasses6_32x32.png";
import glasses6_off_512x512 from "../../../../../public/2DAssets/glasses/glasses6/glasses6_off_512x512.png";
import glasses6_off_32x32 from "../../../../../public/2DAssets/glasses/glasses6/glasses6_off_32x32.png";
import memeGlasses_512x512 from "../../../../../public/2DAssets/glasses/memeGlasses/memeGlasses_512x512.png";
import memeGlasses_32x32 from "../../../../../public/2DAssets/glasses/memeGlasses/memeGlasses_32x32.png";
import memeGlassesIcon from "../../../../../public/svgs/visualEffects/glasses/memeGlasses/memeGlassesIcon.svg";
import memeGlassesOffIcon from "../../../../../public/svgs/visualEffects/glasses/memeGlasses/memeGlassesOffIcon.svg";
import militaryTacticalGlasses_512x512 from "../../../../../public/2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_512x512.png";
import militaryTacticalGlasses_32x32 from "../../../../../public/2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_32x32.png";
import militaryTacticalGlasses_off_512x512 from "../../../../../public/2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_off_512x512.png";
import militaryTacticalGlasses_off_32x32 from "../../../../../public/2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_off_32x32.png";
import shades_512x512 from "../../../../../public/2DAssets/glasses/shades/shades_512x512.png";
import shades_32x32 from "../../../../../public/2DAssets/glasses/shades/shades_32x32.png";
import shadesIcon from "../../../../../public/svgs/visualEffects/glasses/shades/shadesIcon.svg";
import shadesOffIcon from "../../../../../public/svgs/visualEffects/glasses/shades/shadesOffIcon.svg";
import steampunkGlasses_512x512 from "../../../../../public/2DAssets/glasses/steampunkGlasses/steampunkGlasses_512x512.png";
import steampunkGlasses_32x32 from "../../../../../public/2DAssets/glasses/steampunkGlasses/steampunkGlasses_32x32.png";
import steampunkGlasses_off_512x512 from "../../../../../public/2DAssets/glasses/steampunkGlasses/steampunkGlasses_off_512x512.png";
import steampunkGlasses_off_32x32 from "../../../../../public/2DAssets/glasses/steampunkGlasses/steampunkGlasses_off_32x32.png";
import threeDGlasses_512x512 from "../../../../../public/2DAssets/glasses/threeDGlasses/threeDGlasses_512x512.png";
import threeDGlasses_32x32 from "../../../../../public/2DAssets/glasses/threeDGlasses/threeDGlasses_32x32.png";
import threeDGlassesIcon from "../../../../../public/svgs/visualEffects/glasses/threeDGlasses/threeDGlassesIcon.svg";
import threeDGlassesOffIcon from "../../../../../public/svgs/visualEffects/glasses/threeDGlasses/threeDGlassesOffIcon.svg";
import toyGlasses_512x512 from "../../../../../public/2DAssets/glasses/toyGlasses/toyGlasses_512x512.png";
import toyGlasses_32x32 from "../../../../../public/2DAssets/glasses/toyGlasses/toyGlasses_32x32.png";
import toyGlasses_off_512x512 from "../../../../../public/2DAssets/glasses/toyGlasses/toyGlasses_off_512x512.png";
import toyGlasses_off_32x32 from "../../../../../public/2DAssets/glasses/toyGlasses/toyGlasses_off_32x32.png";
import VRGlasses_512x512 from "../../../../../public/2DAssets/glasses/VRGlasses/VRGlasses_512x512.png";
import VRGlasses_32x32 from "../../../../../public/2DAssets/glasses/VRGlasses/VRGlasses_32x32.png";
import VRGlasses_off_512x512 from "../../../../../public/2DAssets/glasses/VRGlasses/VRGlasses_off_512x512.png";
import VRGlasses_off_32x32 from "../../../../../public/2DAssets/glasses/VRGlasses/VRGlasses_off_32x32.png";

const glassesLabels: {
  [glassesEffectType in GlassesEffectTypes]: string;
} = {
  defaultGlasses: "Default",
  AmericaGlasses: "America",
  aviatorGoggles: "Aviator",
  bloodyGlasses: "Bloody",
  eyeProtectionGlasses: "Eye protection",
  glasses1: "Glasses 1",
  glasses2: "Glasses 2",
  glasses3: "Glasses 3",
  glasses4: "Glasses 4",
  glasses5: "Glasses 5",
  glasses6: "Glasses 6",
  memeGlasses: "Meme",
  militaryTacticalGlasses: "Military tactical",
  shades: "Shades",
  steampunkGlasses: "Steampunk",
  threeDGlasses: "3D",
  toyGlasses: "Toy",
  VRGlasses: "VR",
};

export default function GlassesButton({
  username,
  instance,
  type,
  videoId,
  isUser,
  handleVisualEffectChange,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
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
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();
  const { userStreamEffects, remoteStreamEffects } = useStreamsContext();

  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [_, setRerender] = useState(0);
  const glassesContainerRef = useRef<HTMLDivElement>(null);

  const streamEffects = isUser
    ? userStreamEffects.current[type][videoId].glasses
    : remoteStreamEffects.current[username][instance][type][videoId].glasses;
  const effectsStyles = isUser
    ? currentEffectsStyles.current[type][videoId].glasses
    : remoteCurrentEffectsStyles.current[username][instance][type][videoId]
        .glasses;

  const glassesEffects: {
    [key in GlassesEffectTypes]: {
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
    defaultGlasses: {
      image: defaultGlasses_512x512,
      imageSmall: defaultGlasses_32x32,
      icon: defaultGlassesIcon,
      iconOff: defaultGlassesOffIcon,
      flipped: false,
      bgColor: "white",
    },
    AmericaGlasses: {
      image: AmericaGlasses_512x512,
      imageSmall: AmericaGlasses_32x32,
      icon: AmericaGlassesIcon,
      iconOff: AmericaGlassesOffIcon,
      flipped: true,
      bgColor: "white",
    },
    aviatorGoggles: {
      image: aviatorGoggles_512x512,
      imageSmall: aviatorGoggles_32x32,
      imageOff: aviatorGoggles_off_512x512,
      imageOffSmall: aviatorGoggles_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    bloodyGlasses: {
      image: bloodyGlasses_512x512,
      imageSmall: bloodyGlasses_32x32,
      imageOff: bloodyGlasses_off_512x512,
      imageOffSmall: bloodyGlasses_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    eyeProtectionGlasses: {
      image: eyeProtectionGlasses_512x512,
      imageSmall: eyeProtectionGlasses_32x32,
      imageOff: eyeProtectionGlasses_off_512x512,
      imageOffSmall: eyeProtectionGlasses_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    glasses1: {
      image: glasses1_512x512,
      imageSmall: glasses1_32x32,
      imageOff: glasses1_off_512x512,
      imageOffSmall: glasses1_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    glasses2: {
      image: glasses2_512x512,
      imageSmall: glasses2_32x32,
      imageOff: glasses2_off_512x512,
      imageOffSmall: glasses2_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    glasses3: {
      image: glasses3_512x512,
      imageSmall: glasses3_32x32,
      imageOff: glasses3_off_512x512,
      imageOffSmall: glasses3_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    glasses4: {
      image: glasses4_512x512,
      imageSmall: glasses4_32x32,
      imageOff: glasses4_off_512x512,
      imageOffSmall: glasses4_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    glasses5: {
      image: glasses5_512x512,
      imageSmall: glasses5_32x32,
      imageOff: glasses5_off_512x512,
      imageOffSmall: glasses5_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    glasses6: {
      image: glasses6_512x512,
      imageSmall: glasses6_32x32,
      imageOff: glasses6_off_512x512,
      imageOffSmall: glasses6_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    memeGlasses: {
      image: memeGlasses_512x512,
      imageSmall: memeGlasses_32x32,
      icon: memeGlassesIcon,
      iconOff: memeGlassesOffIcon,
      flipped: true,
      bgColor: "white",
    },
    militaryTacticalGlasses: {
      image: militaryTacticalGlasses_512x512,
      imageSmall: militaryTacticalGlasses_32x32,
      imageOff: militaryTacticalGlasses_off_512x512,
      imageOffSmall: militaryTacticalGlasses_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    shades: {
      image: shades_512x512,
      imageSmall: shades_32x32,
      icon: shadesIcon,
      iconOff: shadesOffIcon,
      flipped: false,
      bgColor: "white",
    },
    steampunkGlasses: {
      image: steampunkGlasses_512x512,
      imageSmall: steampunkGlasses_32x32,
      imageOff: steampunkGlasses_off_512x512,
      imageOffSmall: steampunkGlasses_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    threeDGlasses: {
      image: threeDGlasses_512x512,
      imageSmall: threeDGlasses_32x32,
      icon: threeDGlassesIcon,
      iconOff: threeDGlassesOffIcon,
      flipped: false,
      bgColor: "black",
    },
    toyGlasses: {
      image: toyGlasses_512x512,
      imageSmall: toyGlasses_32x32,
      imageOff: toyGlasses_off_512x512,
      imageOffSmall: toyGlasses_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    VRGlasses: {
      image: VRGlasses_512x512,
      imageSmall: VRGlasses_32x32,
      imageOff: VRGlasses_off_512x512,
      imageOffSmall: VRGlasses_off_32x32,
      flipped: false,
      bgColor: "white",
    },
  };

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => prev + 1);

    await handleVisualEffectChange("glasses");

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: React.MouseEvent<Element, MouseEvent>) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.visualEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .visualEffectsButtonValue as GlassesEffectTypes;
    if (
      effectType in glassesEffects &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      if (isUser) {
        if (currentEffectsStyles.current[type][videoId].glasses) {
          currentEffectsStyles.current[type][videoId].glasses.style =
            effectType;
        }
      } else {
        if (
          remoteCurrentEffectsStyles.current[username][instance][type][videoId]
            .glasses
        ) {
          remoteCurrentEffectsStyles.current[username][instance][type][
            videoId
          ].glasses.style = effectType;
        }
      }

      await handleVisualEffectChange("glasses", streamEffects);
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

        if (glassesEffects[effectsStyles.style].icon) {
          const iconSrc =
            glassesEffects[effectsStyles.style][
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
                data-visual-effects-button-value={effectsStyles.style}
              />
            );
          }
        } else {
          const imageSrc =
            glassesEffects[effectsStyles.style][
              streamEffects ? "imageOff" : "image"
            ];

          const imageLoadingSrc =
            glassesEffects[effectsStyles.style][
              streamEffects ? "imageOffSmall" : "imageSmall"
            ];

          if (imageSrc) {
            return (
              <FgImage
                src={imageSrc}
                srcLoading={imageLoadingSrc}
                alt={effectsStyles?.style}
                style={{ width: "90%", height: "90%" }}
                data-visual-effects-button-value={effectsStyles.style}
              />
            );
          }
        }
      }}
      holdContent={
        <div
          ref={glassesContainerRef}
          className='overflow-y-auto small-vertical-scroll-bar max-h-48 mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'
        >
          {Object.entries(glassesEffects).map(([glasses, effect]) => (
            <FgButton
              key={glasses}
              contentFunction={() => (
                <div
                  className={`${
                    glasses === effectsStyles.style
                      ? "border-fg-secondary border-3 border-opacity-100"
                      : ""
                  } ${effect.flipped && "scale-x-[-1]"} ${
                    effect.bgColor === "white" && "bg-white border-fg-black-35"
                  } ${
                    effect.bgColor === "black" && "border-white"
                  } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                  onClick={holdFunction}
                  data-visual-effects-button-value={glasses}
                >
                  <FgImage
                    src={effect.image}
                    srcLoading={effect.imageSmall}
                    alt={glasses}
                    style={{ width: "2.75rem", height: "2.75rem" }}
                    data-visual-effects-button-value={glasses}
                  />
                </div>
              )}
              hoverContent={
                <div className='mb-2 w-max py-1 px-2 text-black font-K2D text-sm bg-white shadow-lg rounded-md relative bottom-0'>
                  {glassesLabels[glasses as GlassesEffectTypes]}
                </div>
              }
              scrollingContainerRef={glassesContainerRef}
              options={{
                hoverZValue: 999999999999999,
                hoverTimeoutDuration: 750,
              }}
            />
          ))}
        </div>
      }
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Glasses
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
  );
}
