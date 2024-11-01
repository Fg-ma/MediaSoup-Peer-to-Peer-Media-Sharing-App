import React, { useRef, useState } from "react";
import FgPanel from "../fgPanel/FgPanel";
import FgButton from "../fgButton/FgButton";
import { useCurrentEffectsStylesContext } from "../context/currentEffectsStylesContext/CurrentEffectsStylesContext";
import { useStreamsContext } from "../context/streamsContext/StreamsContext";
import { BackgroundMusicTypes } from "../context/currentEffectsStylesContext/typeConstant";
import FgImage from "../fgImage/FgImage";

const backgroundMusicLabels: {
  [backgroundMusicType in BackgroundMusicTypes]: string;
} = {
  adventureTime: "Adventure time",
  cacophony: "Cacophony",
  drumBeat: "Drum beat",
  funk: "Funk",
  harmonica: "Harmonica",
  mischief: "Mischief",
  outWest: "Out West",
  piano: "Piano",
  retroGame: "Retro game",
  royalProcession: "Royal procession",
  space: "Space",
  ukulele: "Ukulele",
  wacky: "Wacky",
};

export default function FgBackgroundMusicPortal({
  username,
  instance,
  isUser,
  closeCallback,
  backgroundMusicButtonRef,
}: {
  username: string;
  instance: string;
  isUser: boolean;
  closeCallback: () => void;
  backgroundMusicButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();
  const { userStreamEffects, remoteStreamEffects } = useStreamsContext();

  const streamEffects = isUser
    ? userStreamEffects.current.audio.backgroundMusic
    : remoteStreamEffects.current[username][instance].audio.backgroundMusic;
  const effectsStyles = isUser
    ? currentEffectsStyles.current.audio.backgroundMusic
    : remoteCurrentEffectsStyles.current[username][instance].audio
        .backgroundMusic;

  const [backgroundMusic, setBackgroundMusic] = useState<{
    [backgroundMusicType in BackgroundMusicTypes]: {
      image?: string;
      imageSmall?: string;
      icon?: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  }>({
    adventureTime: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
    cacophony: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
    drumBeat: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
    funk: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
    harmonica: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
    mischief: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
    outWest: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
    piano: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
    retroGame: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
    royalProcession: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
    space: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
    ukulele: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
    wacky: {
      image: "",
      imageSmall: "",
      icon: "",
      flipped: false,
      bgColor: "black",
    },
  });
  const backgroundMusicContainerRef = useRef<HTMLDivElement>(null);

  return (
    <FgPanel
      content={
        <div
          ref={backgroundMusicContainerRef}
          className='small-vertical-scroll-bar p-4 overflow-auto w-full grow relative'
        >
          <div className='w-full h-full min-h-max min-w-max grid grid-cols-5 gap-3 items-center justify-center justify-items-center place-items-center'>
            {Object.entries(backgroundMusic).map(([key, effect]) => (
              <FgButton
                key={key}
                contentFunction={() => (
                  <div
                    className={`${
                      key === effectsStyles.style
                        ? "border-fg-secondary border-3 border-opacity-100"
                        : ""
                    } ${effect.flipped && "scale-x-[-1]"} ${
                      effect.bgColor === "white" &&
                      "bg-white border-fg-black-35"
                    } ${
                      effect.bgColor === "black" && "border-white"
                    } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                    data-background-music-effects-button-value={key}
                  >
                    <FgImage
                      src={effect.image ?? ""}
                      srcLoading={effect.imageSmall}
                      alt={key}
                      style={{ width: "2.75rem", height: "2.75rem" }}
                      data-background-music-effects-button-value={key}
                    />
                  </div>
                )}
                hoverContent={
                  <div className='mb-2 w-max py-1 px-2 text-black font-K2D text-sm bg-white shadow-lg rounded-md relative bottom-0'>
                    {backgroundMusicLabels[key as BackgroundMusicTypes]}
                  </div>
                }
                scrollingContainerRef={backgroundMusicContainerRef}
                options={{
                  hoverZValue: 999999999999999,
                  hoverTimeoutDuration: 750,
                }}
              />
            ))}
          </div>
        </div>
      }
      initPosition={{
        referenceElement: backgroundMusicButtonRef.current ?? undefined,
        placement: "below",
      }}
      minHeight={434}
      minWidth={395}
      initHeight='434px'
      initWidth='395px'
      closeCallback={closeCallback}
      closePosition='topRight'
      shadow={{ left: false, right: false, bottom: true, top: true }}
    />
  );
}
