import React, { useRef, useState } from "react";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import {
  GlassesEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import FgButton from "../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../fgElements/fgSVG/FgSVG";
import FgImageElement from "../../../../fgElements/fgImageElement/FgImageElement";
import FgHoverContentStandard from "../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const defaultGlasses_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/defaultGlasses/defaultGlasses_512x512.png";
const defaultGlasses_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/defaultGlasses/defaultGlasses_32x32.png";
const defaultGlassesIcon =
  nginxAssetSeverBaseUrl +
  "svgs/visualEffects/glasses/defaultGlasses/defaultGlassesIcon.svg";
const defaultGlassesOffIcon =
  nginxAssetSeverBaseUrl +
  "svgs/visualEffects/glasses/defaultGlasses/defaultGlassesOffIcon.svg";
const aviatorGoggles_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/aviatorGoggles/aviatorGoggles_512x512.png";
const aviatorGoggles_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/aviatorGoggles/aviatorGoggles_32x32.png";
const aviatorGoggles_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/aviatorGoggles/aviatorGoggles_off_512x512.png";
const aviatorGoggles_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/aviatorGoggles/aviatorGoggles_off_32x32.png";
const bloodyGlasses_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/bloodyGlasses/bloodyGlasses_512x512.png";
const bloodyGlasses_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/bloodyGlasses/bloodyGlasses_32x32.png";
const bloodyGlasses_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/bloodyGlasses/bloodyGlasses_off_512x512.png";
const bloodyGlasses_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/bloodyGlasses/bloodyGlasses_off_32x32.png";
const eyeProtectionGlasses_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_512x512.png";
const eyeProtectionGlasses_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_32x32.png";
const eyeProtectionGlasses_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_off_512x512.png";
const eyeProtectionGlasses_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/eyeProtectionGlasses/eyeProtectionGlasses_off_32x32.png";
const glasses1_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses1/glasses1_512x512.png";
const glasses1_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses1/glasses1_32x32.png";
const glasses1_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses1/glasses1_off_512x512.png";
const glasses1_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses1/glasses1_off_32x32.png";
const glasses2_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses2/glasses2_512x512.png";
const glasses2_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses2/glasses2_32x32.png";
const glasses2_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses2/glasses2_off_512x512.png";
const glasses2_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses2/glasses2_off_32x32.png";
const glasses3_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses3/glasses3_512x512.png";
const glasses3_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses3/glasses3_32x32.png";
const glasses3_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses3/glasses3_off_512x512.png";
const glasses3_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses3/glasses3_off_32x32.png";
const glasses4_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses4/glasses4_512x512.png";
const glasses4_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses4/glasses4_32x32.png";
const glasses4_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses4/glasses4_off_512x512.png";
const glasses4_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses4/glasses4_off_32x32.png";
const glasses5_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses5/glasses5_512x512.png";
const glasses5_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses5/glasses5_32x32.png";
const glasses5_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses5/glasses5_off_512x512.png";
const glasses5_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses5/glasses5_off_32x32.png";
const glasses6_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses6/glasses6_512x512.png";
const glasses6_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses6/glasses6_32x32.png";
const glasses6_off_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses6/glasses6_off_512x512.png";
const glasses6_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/glasses6/glasses6_off_32x32.png";
const memeGlasses_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/memeGlasses/memeGlasses_512x512.png";
const memeGlasses_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/memeGlasses/memeGlasses_32x32.png";
const memeGlassesIcon =
  nginxAssetSeverBaseUrl +
  "svgs/visualEffects/glasses/memeGlasses/memeGlassesIcon.svg";
const memeGlassesOffIcon =
  nginxAssetSeverBaseUrl +
  "svgs/visualEffects/glasses/memeGlasses/memeGlassesOffIcon.svg";
const militaryTacticalGlasses_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_512x512.png";
const militaryTacticalGlasses_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_32x32.png";
const militaryTacticalGlasses_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_off_512x512.png";
const militaryTacticalGlasses_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/militaryTacticalGlasses/militaryTacticalGlasses_off_32x32.png";
const shades_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/shades/shades_512x512.png";
const shades_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/shades/shades_32x32.png";
const shadesIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/glasses/shades/shadesIcon.svg";
const shadesOffIcon =
  nginxAssetSeverBaseUrl +
  "svgs/visualEffects/glasses/shades/shadesOffIcon.svg";
const steampunkGlasses_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/steampunkGlasses/steampunkGlasses_512x512.png";
const steampunkGlasses_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/steampunkGlasses/steampunkGlasses_32x32.png";
const steampunkGlasses_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/steampunkGlasses/steampunkGlasses_off_512x512.png";
const steampunkGlasses_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/steampunkGlasses/steampunkGlasses_off_32x32.png";
const threeDGlasses_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/threeDGlasses/threeDGlasses_512x512.png";
const threeDGlasses_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/threeDGlasses/threeDGlasses_32x32.png";
const threeDGlassesIcon =
  nginxAssetSeverBaseUrl +
  "svgs/visualEffects/glasses/threeDGlasses/threeDGlassesIcon.svg";
const threeDGlassesOffIcon =
  nginxAssetSeverBaseUrl +
  "svgs/visualEffects/glasses/threeDGlasses/threeDGlassesOffIcon.svg";
const toyGlasses_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/toyGlasses/toyGlasses_512x512.png";
const toyGlasses_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/toyGlasses/toyGlasses_32x32.png";
const toyGlasses_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/toyGlasses/toyGlasses_off_512x512.png";
const toyGlasses_off_32x32 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/toyGlasses/toyGlasses_off_32x32.png";
const VRGlasses_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/VRGlasses/VRGlasses_512x512.png";
const VRGlasses_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/VRGlasses/VRGlasses_32x32.png";
const VRGlasses_off_512x512 =
  nginxAssetSeverBaseUrl +
  "2DAssets/glasses/VRGlasses/VRGlasses_off_512x512.png";
const VRGlasses_off_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/glasses/VRGlasses/VRGlasses_off_32x32.png";

const glassesLabels: {
  [glassesEffectType in GlassesEffectTypes]: string;
} = {
  defaultGlasses: "Default",
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
    blockStateChange?: boolean
  ) => Promise<void>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const {
    userEffectsStyles,
    remoteEffectsStyles,
    userStreamEffects,
    remoteStreamEffects,
  } = useEffectsContext();

  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [_, setRerender] = useState(0);
  const glassesContainerRef = useRef<HTMLDivElement>(null);

  const streamEffects = isUser
    ? userStreamEffects.current[type][visualMediaId].glasses
    : remoteStreamEffects.current[username][instance][type][visualMediaId]
        .glasses;
  const effectsStyles = isUser
    ? userEffectsStyles.current[type][visualMediaId].glasses
    : remoteEffectsStyles.current[username][instance][type][visualMediaId]
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

  const holdFunction = async (event: PointerEvent) => {
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
        if (userEffectsStyles.current[type][visualMediaId].glasses) {
          userEffectsStyles.current[type][visualMediaId].glasses.style =
            effectType;
        }
      } else {
        if (
          remoteEffectsStyles.current[username][instance][type][visualMediaId]
            .glasses
        ) {
          remoteEffectsStyles.current[username][instance][type][
            visualMediaId
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
              <FgImageElement
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
                  onClick={(event) => {
                    holdFunction(event as unknown as PointerEvent);
                  }}
                  data-visual-effects-button-value={glasses}
                >
                  <FgImageElement
                    src={effect.image}
                    srcLoading={effect.imageSmall}
                    alt={glasses}
                    style={{ width: "2.75rem", height: "2.75rem" }}
                    data-visual-effects-button-value={glasses}
                  />
                </div>
              )}
              hoverContent={
                <FgHoverContentStandard
                  content={glassesLabels[glasses as GlassesEffectTypes]}
                />
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
      hoverContent={<FgHoverContentStandard content='Glasses' />}
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
