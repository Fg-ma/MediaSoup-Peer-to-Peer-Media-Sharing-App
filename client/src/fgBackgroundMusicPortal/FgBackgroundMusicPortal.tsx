import React, { useRef, useState } from "react";
import FgPanel from "../fgPanel/FgPanel";
import FgButton from "../fgButton/FgButton";
import { useCurrentEffectsStylesContext } from "../context/currentEffectsStylesContext/CurrentEffectsStylesContext";
import { useStreamsContext } from "../context/streamsContext/StreamsContext";
import { BackgroundMusicTypes } from "../context/currentEffectsStylesContext/typeConstant";
import FgImage from "../fgImage/FgImage";
import FgSVG from "../fgSVG/FgSVG";

import adventureTimeIcon from "../../public/svgs/audioEffects/adventureTimeIcon.svg";
import cacophonyIcon from "../../public/svgs/audioEffects/cacophonyIcon.svg";
import drumBeatIcon from "../../public/svgs/audioEffects/drumBeatIcon.svg";
import funkIcon from "../../public/svgs/audioEffects/funkIcon.svg";
import harmonicIcon from "../../public/svgs/audioEffects/harmonicaIcon.svg";
import mischiefIcon from "../../public/svgs/audioEffects/mischiefIcon.svg";
import outWestIcon from "../../public/svgs/audioEffects/outWestIcon.svg";
import pianoBackgroundMusicIcon from "../../public/svgs/audioEffects/pianoBackgroundMusicIcon.svg";
import retroGameIcon from "../../public/svgs/audioEffects/retroGameIcon.svg";
import spaceBackgroundMusicIcon from "../../public/svgs/audioEffects/spaceBackgroundMusicIcon.svg";
import ukuleleIcon from "../../public/svgs/audioEffects/ukuleleIcon.svg";
import wackyIcon from "../../public/svgs/audioEffects/wackyIcon.svg";

import royalProcession_512x512 from "../../public/2DAssets/audio/royalProcession_512x512.png";
import royalProcession_32x32 from "../../public/2DAssets/audio/royalProcession_32x32.png";

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
  const { userMedia } = useStreamsContext();

  const effectsStyles = isUser
    ? currentEffectsStyles.current.audio.backgroundMusic
    : remoteCurrentEffectsStyles.current[username][instance].audio
        .backgroundMusic;

  const [backgroundMusic, setBackgroundMusic] = useState<{
    [backgroundMusicType in BackgroundMusicTypes]: {
      image?: string;
      imageSmall?: string;
      icon?: string;
      bgColor: "white" | "black";
      playing: boolean;
      path: string;
    };
  }>({
    adventureTime: {
      icon: adventureTimeIcon,
      bgColor: "black",
      playing: false,
      path: "/backgroundMusic/adventureTime.mp3",
    },
    cacophony: {
      icon: cacophonyIcon,
      bgColor: "black",
      playing: false,
      path: "/backgroundMusic/cacophony.mp3",
    },
    drumBeat: {
      icon: drumBeatIcon,
      bgColor: "black",
      playing: false,
      path: "/backgroundMusic/drumBeat.mp3",
    },
    funk: {
      icon: funkIcon,
      bgColor: "black",
      playing: false,
      path: "/backgroundMusic/funk.mp3",
    },
    harmonica: {
      icon: harmonicIcon,
      bgColor: "black",
      playing: false,
      path: "/backgroundMusic/harmonica.mp3",
    },
    mischief: {
      icon: mischiefIcon,
      bgColor: "black",
      playing: false,
      path: "/backgroundMusic/mischief.mp3",
    },
    outWest: {
      icon: outWestIcon,
      bgColor: "black",
      playing: false,
      path: "/backgroundMusic/outWest.mp3",
    },
    piano: {
      icon: pianoBackgroundMusicIcon,
      bgColor: "black",
      playing: false,
      path: "/backgroundMusic/piano.mp3",
    },
    retroGame: {
      icon: retroGameIcon,
      bgColor: "black",
      playing: false,
      path: "/backgroundMusic/retroGame.mp3",
    },
    royalProcession: {
      image: royalProcession_512x512,
      imageSmall: royalProcession_32x32,
      bgColor: "white",
      playing: false,
      path: "/backgroundMusic/royalProcession.mp3",
    },
    space: {
      icon: spaceBackgroundMusicIcon,
      bgColor: "black",
      playing: false,
      path: "/backgroundMusic/space.mp3",
    },
    ukulele: {
      icon: ukuleleIcon,
      bgColor: "black",
      playing: false,
      path: "/backgroundMusic/ukulele.mp3",
    },
    wacky: {
      icon: wackyIcon,
      bgColor: "black",
      playing: false,
      path: "/backgroundMusic/wacky.mp3",
    },
  });
  const [importedFiles, setImportedFiles] = useState<{
    [backgroundMusicTypes in BackgroundMusicTypes]?: {
      file: File;
      path: string;
    };
  }>({});
  const [cols, setCols] = useState(3);
  const backgroundMusicContainerRef = useRef<HTMLDivElement>(null);

  const gridColumnsChange = () => {
    if (!backgroundMusicContainerRef.current) return;

    const width = backgroundMusicContainerRef.current.clientWidth;
    if (width < 300) {
      if (cols !== 3) setCols(3);
    } else if (width < 500) {
      if (cols !== 4) setCols(4);
    } else if (width < 700) {
      if (cols !== 5) setCols(5);
    } else if (width >= 700) {
      if (cols !== 6) setCols(6);
    }
  };

  const playAudio = async (
    backgroundMusicType: BackgroundMusicTypes,
    path: string
  ): Promise<boolean> => {
    const url = importedFiles[backgroundMusicType]
      ? importedFiles[backgroundMusicType].path
      : path;

    // Start playback with Tone.js and load the sound if it hasn't been loaded
    if (
      !userMedia.current.audio?.audioEffects.fgBackgroundMusic.players[
        backgroundMusicType
      ]
    ) {
      await userMedia.current.audio?.audioEffects.fgBackgroundMusic.loadBackgroundMusic(
        backgroundMusicType,
        url
      );
    } else if (
      userMedia.current.audio?.audioEffects.fgBackgroundMusic.players[
        backgroundMusicType
      ].url !== url
    ) {
      userMedia.current.audio?.audioEffects.fgBackgroundMusic.swapPlayer(
        backgroundMusicType,
        url
      );
    }

    return (
      userMedia.current.audio?.audioEffects.fgBackgroundMusic.toggleAudio(
        backgroundMusicType,
        false
      ) ?? false
    );
  };

  const toggleAudio = async (
    backgroundMusicType: BackgroundMusicTypes
  ): Promise<boolean> => {
    let succeeded = false;

    const { playing, path } = backgroundMusic[backgroundMusicType];
    if (playing) {
      // Stop playback
      succeeded =
        userMedia.current.audio?.audioEffects.fgBackgroundMusic.toggleAudio(
          backgroundMusicType,
          true
        ) ?? false;
    } else {
      succeeded = await playAudio(backgroundMusicType, path);
    }

    if (succeeded) {
      setBackgroundMusic((prevEffects) => {
        const backgroundMusic = prevEffects[backgroundMusicType];
        const { playing } = backgroundMusic;

        if (playing) {
          return {
            ...prevEffects,
            [backgroundMusicType]: {
              ...backgroundMusic,
              playing: false,
            },
          };
        } else {
          return {
            ...prevEffects,
            [backgroundMusicType]: {
              ...backgroundMusic,
              playing: true,
            },
          };
        }
      });
    }

    return succeeded;
  };

  return (
    <FgPanel
      content={
        <div
          ref={backgroundMusicContainerRef}
          className='small-vertical-scroll-bar overflow-y-auto overflow-x-hidden w-full h-full'
        >
          <div
            className={`py-2 w-full h-full min-h-max min-w-max grid gap-3 items-center justify-center justify-items-center place-items-center ${
              cols === 3
                ? "grid-cols-3"
                : cols === 4
                ? "grid-cols-4"
                : cols === 5
                ? "grid-cols-5"
                : "grid-cols-6"
            }`}
          >
            {Object.entries(backgroundMusic).map(([key, effect]) => (
              <FgButton
                key={key}
                clickFunction={() => toggleAudio(key as BackgroundMusicTypes)}
                contentFunction={() => (
                  <div
                    className={`${
                      key === effectsStyles.style
                        ? "border-fg-secondary border-3 border-opacity-100"
                        : ""
                    } ${
                      effect.bgColor === "white"
                        ? "bg-white border-fg-black-35"
                        : ""
                    } ${
                      effect.bgColor === "black"
                        ? "bg-black bg-opacity-85 border-white"
                        : ""
                    } ${
                      effect.playing ? "border-fg-secondary border-3" : ""
                    } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                    data-background-music-effects-button-value={key}
                  >
                    {effect.image ? (
                      <FgImage
                        src={effect.image}
                        srcLoading={effect.imageSmall}
                        alt={key}
                        style={{ width: "3.25rem", height: "3.25rem" }}
                        data-background-music-effects-button-value={key}
                      />
                    ) : (
                      <FgSVG
                        src={effect.icon ?? ""}
                        attributes={[
                          { key: "width", value: "100%" },
                          { key: "height", value: "100%" },
                          { key: "fill", value: "white" },
                          { key: "stroke", value: "white" },
                        ]}
                        data-background-music-effects-button-value={key}
                      />
                    )}
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
      initWidth={"245px"}
      initHeight={"235px"}
      minWidth={245}
      minHeight={235}
      closeCallback={closeCallback}
      closePosition='topRight'
      shadow={{ bottom: true, top: true }}
      resizeCallback={gridColumnsChange}
    />
  );
}
