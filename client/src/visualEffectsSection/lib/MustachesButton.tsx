import React, { useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgImage from "../../fgImage/FgImage";
import {
  useCurrentEffectsStylesContext,
  MustachesEffectTypes,
  mustacheNoseOffsetsMap,
} from "../../context/CurrentEffectsStylesContext";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";

import mustache1 from "../../../public/2DAssets/mustaches/mustache1/mustache1.png";
import loading_mustache1 from "../../../public/2DAssets/mustaches/mustache1/loading_mustache1.png";
import mustache2 from "../../../public/2DAssets/mustaches/mustache2/mustache2.png";
import loading_mustache2 from "../../../public/2DAssets/mustaches/mustache2/loading_mustache2.png";
import mustache3 from "../../../public/2DAssets/mustaches/mustache3/mustache3.png";
import loading_mustache3 from "../../../public/2DAssets/mustaches/mustache3/loading_mustache3.png";
import mustache4 from "../../../public/2DAssets/mustaches/mustache4/mustache4.png";
import loading_mustache4 from "../../../public/2DAssets/mustaches/mustache4/loading_mustache4.png";
import disguiseMustache from "../../../public/2DAssets/mustaches/disguiseMustache/disguiseMustache.png";
import loading_disguiseMustache from "../../../public/2DAssets/mustaches/disguiseMustache/loading_disguiseMustache.png";
import mustache1Icon from "../../../public/svgs/mustaches/mustache1/mustache1Icon.svg";
import mustache1OffIcon from "../../../public/svgs/mustaches/mustache1/mustache1OffIcon.svg";
import threeDim_mustache1Icon from "../../../public/svgs/mustaches/mustache1/threeDim_mustache1Icon.svg";
import threeDim_mustache1OffIcon from "../../../public/svgs/mustaches/mustache1/threeDim_mustache1OffIcon.svg";
import mustache2Icon from "../../../public/svgs/mustaches/mustache2/mustache2Icon.svg";
import mustache2OffIcon from "../../../public/svgs/mustaches/mustache2/mustache2OffIcon.svg";
import threeDim_mustache2Icon from "../../../public/svgs/mustaches/mustache2/threeDim_mustache2Icon.svg";
import threeDim_mustache2OffIcon from "../../../public/svgs/mustaches/mustache2/threeDim_mustache2OffIcon.svg";
import mustache3Icon from "../../../public/svgs/mustaches/mustache3/mustache3Icon.svg";
import mustache3OffIcon from "../../../public/svgs/mustaches/mustache3/mustache3OffIcon.svg";
import threeDim_mustache3Icon from "../../../public/svgs/mustaches/mustache3/threeDim_mustache3Icon.svg";
import threeDim_mustache3OffIcon from "../../../public/svgs/mustaches/mustache3/threeDim_mustache3OffIcon.svg";
import mustache4Icon from "../../../public/svgs/mustaches/mustache4/mustache4Icon.svg";
import mustache4OffIcon from "../../../public/svgs/mustaches/mustache4/mustache4OffIcon.svg";
import threeDim_mustache4Icon from "../../../public/svgs/mustaches/mustache4/threeDim_mustache4Icon.svg";
import threeDim_mustache4OffIcon from "../../../public/svgs/mustaches/mustache4/threeDim_mustache4OffIcon.svg";
import disguiseMustacheIcon from "../../../public/svgs/mustaches/disguiseMustache/disguiseMustacheIcon.svg";
import disguiseMustacheOffIcon from "../../../public/svgs/mustaches/disguiseMustache/disguiseMustacheOffIcon.svg";
import threeDim_disguiseMustacheIcon from "../../../public/svgs/mustaches/disguiseMustache/threeDim_disguiseMustacheIcon.svg";
import threeDim_disguiseMustacheOffIcon from "../../../public/svgs/mustaches/disguiseMustache/threeDim_disguiseMustacheOffIcon.svg";

export default function MustachesButton({
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
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();
  const { userStreamEffects, remoteStreamEffects } = useStreamsContext();

  const [rerender, setRerender] = useState(0);

  const streamEffects = isUser
    ? userStreamEffects.current[type][videoId].mustaches
    : remoteStreamEffects.current[username][instance][type][videoId].mustaches;
  const effectsStyles = isUser
    ? currentEffectsStyles.current[type][videoId].mustaches
    : remoteCurrentEffectsStyles.current[username][instance][type][videoId]
        .mustaches;

  const mustachesEffects: {
    [key in MustachesEffectTypes]: {
      image: string;
      loading: string;
      icon: string;
      offIcon: string;
      threeDimIcon: string;
      threeDimOffIcon: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    mustache1: {
      image: mustache1,
      loading: loading_mustache1,
      icon: mustache1Icon,
      offIcon: mustache1OffIcon,
      threeDimIcon: threeDim_mustache1Icon,
      threeDimOffIcon: threeDim_mustache1OffIcon,
      flipped: false,
      bgColor: "white",
    },
    mustache2: {
      image: mustache2,
      loading: loading_mustache2,
      icon: mustache2Icon,
      offIcon: mustache2OffIcon,
      threeDimIcon: threeDim_mustache2Icon,
      threeDimOffIcon: threeDim_mustache2OffIcon,
      flipped: false,
      bgColor: "white",
    },
    mustache3: {
      image: mustache3,
      loading: loading_mustache3,
      icon: mustache3Icon,
      offIcon: mustache3OffIcon,
      threeDimIcon: threeDim_mustache3Icon,
      threeDimOffIcon: threeDim_mustache3OffIcon,
      flipped: false,
      bgColor: "white",
    },
    mustache4: {
      image: mustache4,
      loading: loading_mustache4,
      icon: mustache4Icon,
      offIcon: mustache4OffIcon,
      threeDimIcon: threeDim_mustache4Icon,
      threeDimOffIcon: threeDim_mustache4OffIcon,
      flipped: false,
      bgColor: "white",
    },
    disguiseMustache: {
      image: disguiseMustache,
      loading: loading_disguiseMustache,
      icon: disguiseMustacheIcon,
      offIcon: disguiseMustacheOffIcon,
      threeDimIcon: threeDim_disguiseMustacheIcon,
      threeDimOffIcon: threeDim_disguiseMustacheOffIcon,
      flipped: false,
      bgColor: "white",
    },
  };

  return (
    <FgButton
      clickFunction={async () => {
        setEffectsDisabled(true);
        setRerender((prev) => prev + 1);

        await handleVisualEffectChange("mustaches");

        setEffectsDisabled(false);
      }}
      holdFunction={async (event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (!effectsStyles || !target || !target.dataset.value) {
          return;
        }

        setEffectsDisabled(true);

        const effectType = target.dataset.value as MustachesEffectTypes;
        if (
          effectType in mustachesEffects &&
          (effectsStyles.style !== effectType || !streamEffects)
        ) {
          if (isUser) {
            if (currentEffectsStyles.current[type][videoId].mustaches) {
              currentEffectsStyles.current[type][videoId].mustaches.style =
                effectType;
              currentEffectsStyles.current[type][videoId].mustaches.noseOffset =
                mustacheNoseOffsetsMap[effectType];
            }
          } else {
            if (
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].mustaches
            ) {
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].mustaches.style = effectType;
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].mustaches.noseOffset = mustacheNoseOffsetsMap[effectType];
            }
          }

          await handleVisualEffectChange(
            "mustaches",
            isUser
              ? userStreamEffects.current[type][videoId].mustaches
              : remoteStreamEffects.current[username][instance][type][videoId]
                  .mustaches
          );
        }

        setEffectsDisabled(false);
      }}
      contentFunction={() => {
        if (!effectsStyles) {
          return;
        }

        const iconSrc =
          mustachesEffects[effectsStyles.style][
            effectsStyles.threeDim
              ? streamEffects
                ? "threeDimOffIcon"
                : "threeDimIcon"
              : streamEffects
              ? "offIcon"
              : "icon"
          ];

        return (
          <FgSVG
            src={iconSrc}
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
            ]}
            data-value={effectsStyles.style}
          />
        );
      }}
      doubleClickFunction={async () => {
        if (!effectsStyles) {
          return;
        }

        setEffectsDisabled(true);

        effectsStyles.threeDim = !effectsStyles.threeDim;

        await handleVisualEffectChange("mustaches", streamEffects);

        setRerender((prev) => prev + 1);

        setEffectsDisabled(false);
      }}
      holdContent={
        <div className='mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
          {Object.entries(mustachesEffects).map(([mustaches, effect]) => (
            <div
              key={mustaches}
              className={`${effect.flipped && "scale-x-[-1]"} ${
                effect.bgColor === "white" && "bg-white border-fg-black-35"
              } ${
                effect.bgColor === "black" && "border-white"
              } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75 relative`}
              data-value={mustaches}
            >
              <FgImage
                src={effect.image}
                srcLoading={effect.loading}
                alt={mustaches}
                style={{ width: "90%" }}
                data-value={mustaches}
              />
            </div>
          ))}
        </div>
      }
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Mustache
        </div>
      }
      className='flex items-center justify-center min-w-10 w-10 aspect-square'
      options={{
        defaultDataValue: effectsStyles?.style,
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
      }}
    />
  );
}
