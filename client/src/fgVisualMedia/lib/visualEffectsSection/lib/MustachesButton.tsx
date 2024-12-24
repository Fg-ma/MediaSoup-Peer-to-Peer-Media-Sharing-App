import React, { useRef, useState } from "react";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import {
  MustachesEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import FgButton from "../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../fgElements/fgSVG/FgSVG";
import FgImage from "../../../../fgElements/fgImage/FgImage";
import FgHoverContentStandard from "../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";

import disguiseMustache_512x512 from "../../../../../public/2DAssets/mustaches/disguiseMustache/disguiseMustache_512x512.png";
import disguiseMustache_32x32 from "../../../../../public/2DAssets/mustaches/disguiseMustache/disguiseMustache_32x32.png";
import disguiseMustacheIcon from "../../../../../public/svgs/visualEffects/mustaches/disguiseMustache/disguiseMustacheIcon.svg";
import disguiseMustacheOffIcon from "../../../../../public/svgs/visualEffects/mustaches/disguiseMustache/disguiseMustacheOffIcon.svg";
import fullMustache_512x512 from "../../../../../public/2DAssets/mustaches/fullMustache/fullMustache_512x512.png";
import fullMustache_32x32 from "../../../../../public/2DAssets/mustaches/fullMustache/fullMustache_32x32.png";
import fullMustache_off_512x512 from "../../../../../public/2DAssets/mustaches/fullMustache/fullMustache_off_512x512.png";
import fullMustache_off_32x32 from "../../../../../public/2DAssets/mustaches/fullMustache/fullMustache_off_32x32.png";
import mustache1_512x512 from "../../../../../public/2DAssets/mustaches/mustache1/mustache1_512x512.png";
import mustache1_32x32 from "../../../../../public/2DAssets/mustaches/mustache1/mustache1_32x32.png";
import mustache1Icon from "../../../../../public/svgs/visualEffects/mustaches/mustache1/mustache1Icon.svg";
import mustache1OffIcon from "../../../../../public/svgs/visualEffects/mustaches/mustache1/mustache1OffIcon.svg";
import mustache2_512x512 from "../../../../../public/2DAssets/mustaches/mustache2/mustache2_512x512.png";
import mustache2_32x32 from "../../../../../public/2DAssets/mustaches/mustache2/mustache2_32x32.png";
import mustache2Icon from "../../../../../public/svgs/visualEffects/mustaches/mustache2/mustache2Icon.svg";
import mustache2OffIcon from "../../../../../public/svgs/visualEffects/mustaches/mustache2/mustache2OffIcon.svg";
import mustache3_512x512 from "../../../../../public/2DAssets/mustaches/mustache3/mustache3_512x512.png";
import mustache3_32x32 from "../../../../../public/2DAssets/mustaches/mustache3/mustache3_32x32.png";
import mustache3Icon from "../../../../../public/svgs/visualEffects/mustaches/mustache3/mustache3Icon.svg";
import mustache3OffIcon from "../../../../../public/svgs/visualEffects/mustaches/mustache3/mustache3OffIcon.svg";
import mustache4_512x512 from "../../../../../public/2DAssets/mustaches/mustache4/mustache4_512x512.png";
import mustache4_32x32 from "../../../../../public/2DAssets/mustaches/mustache4/mustache4_32x32.png";
import mustache4Icon from "../../../../../public/svgs/visualEffects/mustaches/mustache4/mustache4Icon.svg";
import mustache4OffIcon from "../../../../../public/svgs/visualEffects/mustaches/mustache4/mustache4OffIcon.svg";
import nicodemusMustache_512x512 from "../../../../../public/2DAssets/mustaches/nicodemusMustache/nicodemusMustache_512x512.png";
import nicodemusMustache_32x32 from "../../../../../public/2DAssets/mustaches/nicodemusMustache/nicodemusMustache_32x32.png";
import nicodemusMustache_off_512x512 from "../../../../../public/2DAssets/mustaches/nicodemusMustache/nicodemusMustache_off_512x512.png";
import nicodemusMustache_off_32x32 from "../../../../../public/2DAssets/mustaches/nicodemusMustache/nicodemusMustache_off_32x32.png";
import pencilMustache_512x512 from "../../../../../public/2DAssets/mustaches/pencilMustache/pencilMustache_512x512.png";
import pencilMustache_32x32 from "../../../../../public/2DAssets/mustaches/pencilMustache/pencilMustache_32x32.png";
import pencilMustache_off_512x512 from "../../../../../public/2DAssets/mustaches/pencilMustache/pencilMustache_off_512x512.png";
import pencilMustache_off_32x32 from "../../../../../public/2DAssets/mustaches/pencilMustache/pencilMustache_off_32x32.png";
import spongebobMustache_512x512 from "../../../../../public/2DAssets/mustaches/spongebobMustache/spongebobMustache_512x512.png";
import spongebobMustache_32x32 from "../../../../../public/2DAssets/mustaches/spongebobMustache/spongebobMustache_32x32.png";
import spongebobMustache_off_512x512 from "../../../../../public/2DAssets/mustaches/spongebobMustache/spongebobMustache_off_512x512.png";
import spongebobMustache_off_32x32 from "../../../../../public/2DAssets/mustaches/spongebobMustache/spongebobMustache_off_32x32.png";
import tinyMustache_512x512 from "../../../../../public/2DAssets/mustaches/tinyMustache/tinyMustache_512x512.png";
import tinyMustache_32x32 from "../../../../../public/2DAssets/mustaches/tinyMustache/tinyMustache_32x32.png";
import tinyMustache_off_512x512 from "../../../../../public/2DAssets/mustaches/tinyMustache/tinyMustache_off_512x512.png";
import tinyMustache_off_32x32 from "../../../../../public/2DAssets/mustaches/tinyMustache/tinyMustache_off_32x32.png";
import wingedMustache_512x512 from "../../../../../public/2DAssets/mustaches/wingedMustache/wingedMustache_512x512.png";
import wingedMustache_32x32 from "../../../../../public/2DAssets/mustaches/wingedMustache/wingedMustache_32x32.png";
import wingedMustache_off_512x512 from "../../../../../public/2DAssets/mustaches/wingedMustache/wingedMustache_off_512x512.png";
import wingedMustache_off_32x32 from "../../../../../public/2DAssets/mustaches/wingedMustache/wingedMustache_off_32x32.png";

const mustachesLabels: {
  [beardsEffectType in MustachesEffectTypes]: string;
} = {
  disguiseMustache: "Disguise",
  fullMustache: "Full",
  mustache1: "Mustache 1",
  mustache2: "Mustache 2",
  mustache3: "Mustache 3",
  mustache4: "Mustache 4",
  nicodemusMustache: "Nicodemus",
  pencilMustache: "Pencil",
  spongebobMustache: "Squiggly",
  tinyMustache: "Tiny",
  wingedMustache: "Winged",
};

export default function MustachesButton({
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
  const mustachesContainerRef = useRef<HTMLDivElement>(null);

  const streamEffects = isUser
    ? userStreamEffects.current[type][visualMediaId].mustaches
    : remoteStreamEffects.current[username][instance][type][visualMediaId]
        .mustaches;
  const effectsStyles = isUser
    ? userEffectsStyles.current[type][visualMediaId].mustaches
    : remoteEffectsStyles.current[username][instance][type][visualMediaId]
        .mustaches;

  const mustachesEffects: {
    [key in MustachesEffectTypes]: {
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
    disguiseMustache: {
      image: disguiseMustache_512x512,
      imageSmall: disguiseMustache_32x32,
      icon: disguiseMustacheIcon,
      iconOff: disguiseMustacheOffIcon,
      flipped: false,
      bgColor: "white",
    },
    fullMustache: {
      image: fullMustache_512x512,
      imageSmall: fullMustache_32x32,
      imageOff: fullMustache_off_512x512,
      imageOffSmall: fullMustache_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    mustache1: {
      image: mustache1_512x512,
      imageSmall: mustache1_32x32,
      icon: mustache1Icon,
      iconOff: mustache1OffIcon,
      flipped: false,
      bgColor: "white",
    },
    mustache2: {
      image: mustache2_512x512,
      imageSmall: mustache2_32x32,
      icon: mustache2Icon,
      iconOff: mustache2OffIcon,
      flipped: false,
      bgColor: "white",
    },
    mustache3: {
      image: mustache3_512x512,
      imageSmall: mustache3_32x32,
      icon: mustache3Icon,
      iconOff: mustache3OffIcon,
      flipped: false,
      bgColor: "white",
    },
    mustache4: {
      image: mustache4_512x512,
      imageSmall: mustache4_32x32,
      icon: mustache4Icon,
      iconOff: mustache4OffIcon,
      flipped: false,
      bgColor: "white",
    },
    nicodemusMustache: {
      image: nicodemusMustache_512x512,
      imageSmall: nicodemusMustache_32x32,
      imageOff: nicodemusMustache_off_512x512,
      imageOffSmall: nicodemusMustache_off_32x32,
      flipped: false,
      bgColor: "black",
    },
    pencilMustache: {
      image: pencilMustache_512x512,
      imageSmall: pencilMustache_32x32,
      imageOff: pencilMustache_off_512x512,
      imageOffSmall: pencilMustache_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    spongebobMustache: {
      image: spongebobMustache_512x512,
      imageSmall: spongebobMustache_32x32,
      imageOff: spongebobMustache_off_512x512,
      imageOffSmall: spongebobMustache_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    tinyMustache: {
      image: tinyMustache_512x512,
      imageSmall: tinyMustache_32x32,
      imageOff: tinyMustache_off_512x512,
      imageOffSmall: tinyMustache_off_32x32,
      flipped: false,
      bgColor: "white",
    },
    wingedMustache: {
      image: wingedMustache_512x512,
      imageSmall: wingedMustache_32x32,
      imageOff: wingedMustache_off_512x512,
      imageOffSmall: wingedMustache_off_32x32,
      flipped: false,
      bgColor: "black",
    },
  };

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => prev + 1);

    await handleVisualEffectChange("mustaches");

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.visualEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .visualEffectsButtonValue as MustachesEffectTypes;
    if (
      effectType in mustachesEffects &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      if (isUser) {
        if (userEffectsStyles.current[type][visualMediaId].mustaches) {
          userEffectsStyles.current[type][visualMediaId].mustaches.style =
            effectType;
        }
      } else {
        if (
          remoteEffectsStyles.current[username][instance][type][visualMediaId]
            .mustaches
        ) {
          remoteEffectsStyles.current[username][instance][type][
            visualMediaId
          ].mustaches.style = effectType;
        }
      }

      await handleVisualEffectChange("mustaches", streamEffects);
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

        if (mustachesEffects[effectsStyles.style].icon) {
          const iconSrc =
            mustachesEffects[effectsStyles.style][
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
            mustachesEffects[effectsStyles.style][
              streamEffects ? "imageOff" : "image"
            ];

          const imageLoadingSrc =
            mustachesEffects[effectsStyles.style][
              streamEffects ? "imageOffSmall" : "imageSmall"
            ];

          if (imageSrc) {
            return (
              <FgImage
                src={imageSrc}
                srcLoading={imageLoadingSrc}
                alt={effectsStyles.style}
                style={{ width: "90%", height: "90%" }}
                data-visual-effects-button-value={effectsStyles.style}
              />
            );
          }
        }
      }}
      holdContent={
        <div
          ref={mustachesContainerRef}
          className='overflow-y-auto small-vertical-scroll-bar max-h-48 mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'
        >
          {Object.entries(mustachesEffects).map(([mustache, effect]) => (
            <FgButton
              key={mustache}
              contentFunction={() => (
                <div
                  className={`${
                    mustache === effectsStyles.style
                      ? "border-fg-secondary border-3 border-opacity-100"
                      : ""
                  } ${effect.flipped && "scale-x-[-1]"} ${
                    effect.bgColor === "white" && "bg-white border-fg-black-35"
                  } ${
                    effect.bgColor === "black" && "border-white"
                  } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75 relative`}
                  onClick={(event) => {
                    holdFunction(event as unknown as PointerEvent);
                  }}
                  data-visual-effects-button-value={mustache}
                >
                  <FgImage
                    src={effect.image}
                    srcLoading={effect.imageSmall}
                    alt={mustache}
                    style={{ width: "2.75rem", height: "2.75rem" }}
                    data-visual-effects-button-value={mustache}
                  />
                </div>
              )}
              hoverContent={
                <FgHoverContentStandard
                  content={mustachesLabels[mustache as MustachesEffectTypes]}
                />
              }
              scrollingContainerRef={mustachesContainerRef}
              options={{
                hoverZValue: 999999999999999,
                hoverTimeoutDuration: 750,
              }}
            />
          ))}
        </div>
      }
      hoverContent={<FgHoverContentStandard content='Mustaches' />}
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
