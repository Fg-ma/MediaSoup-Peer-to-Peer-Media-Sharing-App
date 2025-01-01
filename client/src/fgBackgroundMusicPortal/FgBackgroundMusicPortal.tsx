import React, { useRef, useState } from "react";
import FgPanel from "../fgElements/fgPanel/FgPanel";
import FgButton from "../fgElements/fgButton/FgButton";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { BackgroundMusicTypes } from "../context/effectsContext/typeConstant";
import FgImageElement from "../fgElements/fgImageElement/FgImageElement";
import FgSVG from "../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../fgElements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetSeverBaseUrl + "svgs/additionIcon.svg";
const adventureTimeIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/adventureTimeIcon.svg";
const cacophonyIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/cacophonyIcon.svg";
const drumBeatIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/drumBeatIcon.svg";
const funkIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/funkIcon.svg";
const harmonicIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/harmonicaIcon.svg";
const mischiefIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/mischiefIcon.svg";
const outWestIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/outWestIcon.svg";
const pianoBackgroundMusicIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/pianoBackgroundMusicIcon.svg";
const retroGameIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/retroGameIcon.svg";
const spaceBackgroundMusicIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/spaceBackgroundMusicIcon.svg";
const ukuleleIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/ukuleleIcon.svg";
const wackyIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/wackyIcon.svg";
const royalProcession_512x512 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/royalProcession_512x512.png";
const royalProcession_32x32 =
  nginxAssetSeverBaseUrl + "2DAssets/audio/royalProcession_32x32.png";

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
  closeCallback,
  backgroundMusicButtonRef,
}: {
  closeCallback: () => void;
  backgroundMusicButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const { userMedia } = useMediaContext();

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
      path: nginxAssetSeverBaseUrl + "backgroundMusic/adventureTime.mp3",
    },
    cacophony: {
      icon: cacophonyIcon,
      bgColor: "black",
      playing: false,
      path: nginxAssetSeverBaseUrl + "backgroundMusic/cacophony.mp3",
    },
    drumBeat: {
      icon: drumBeatIcon,
      bgColor: "black",
      playing: false,
      path: nginxAssetSeverBaseUrl + "backgroundMusic/drumBeat.mp3",
    },
    funk: {
      icon: funkIcon,
      bgColor: "black",
      playing: false,
      path: nginxAssetSeverBaseUrl + "backgroundMusic/funk.mp3",
    },
    harmonica: {
      icon: harmonicIcon,
      bgColor: "black",
      playing: false,
      path: nginxAssetSeverBaseUrl + "backgroundMusic/harmonica.mp3",
    },
    mischief: {
      icon: mischiefIcon,
      bgColor: "black",
      playing: false,
      path: nginxAssetSeverBaseUrl + "backgroundMusic/mischief.mp3",
    },
    outWest: {
      icon: outWestIcon,
      bgColor: "black",
      playing: false,
      path: nginxAssetSeverBaseUrl + "backgroundMusic/outWest.mp3",
    },
    piano: {
      icon: pianoBackgroundMusicIcon,
      bgColor: "black",
      playing: false,
      path: nginxAssetSeverBaseUrl + "backgroundMusic/piano.mp3",
    },
    retroGame: {
      icon: retroGameIcon,
      bgColor: "black",
      playing: false,
      path: nginxAssetSeverBaseUrl + "backgroundMusic/retroGame.mp3",
    },
    royalProcession: {
      image: royalProcession_512x512,
      imageSmall: royalProcession_32x32,
      bgColor: "white",
      playing: false,
      path: nginxAssetSeverBaseUrl + "backgroundMusic/royalProcession.mp3",
    },
    space: {
      icon: spaceBackgroundMusicIcon,
      bgColor: "black",
      playing: false,
      path: nginxAssetSeverBaseUrl + "backgroundMusic/space.mp3",
    },
    ukulele: {
      icon: ukuleleIcon,
      bgColor: "black",
      playing: false,
      path: nginxAssetSeverBaseUrl + "backgroundMusic/ukulele.mp3",
    },
    wacky: {
      icon: wackyIcon,
      bgColor: "black",
      playing: false,
      path: nginxAssetSeverBaseUrl + "backgroundMusic/wacky.mp3",
    },
  });
  const [importedFiles, setImportedFiles] = useState<
    Record<number, { file: File; playing: boolean }>
  >({});
  const [cols, setCols] = useState(3);
  const backgroundMusicContainerRef = useRef<HTMLDivElement>(null);
  const backgroundMusicScrollingContainerRef = useRef<HTMLDivElement>(null);
  const fileSelectorRef = useRef<HTMLInputElement>(null);

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
    // Start playback with Tone.js and load the sound if it hasn't been loaded
    if (
      !userMedia.current.audio?.audioEffects.fgBackgroundMusic.players[
        backgroundMusicType
      ]
    ) {
      await userMedia.current.audio?.audioEffects.fgBackgroundMusic.loadBackgroundMusic(
        backgroundMusicType,
        path
      );
    }

    return (
      userMedia.current.audio?.audioEffects.fgBackgroundMusic.toggleAudio(
        backgroundMusicType,
        false
      ) ?? false
    );
  };

  const toggleAudio = async (backgroundMusicType: BackgroundMusicTypes) => {
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
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImportedFiles((prevFiles) => {
        const nextIndex = Object.keys(prevFiles).length + 1;
        const newFiles: Record<number, { file: File; playing: boolean }> = {};

        // Convert FileList to an object, incrementing the index for each new file
        Array.from(files).forEach((file, index) => {
          newFiles[nextIndex + index] = { file, playing: false };
        });

        // Append new files to the existing importedFiles state
        return {
          ...prevFiles,
          ...newFiles,
        };
      });
    }
  };

  const handleImportEffectClickDown = () => {
    fileSelectorRef.current?.click();
  };

  const playImportedAudio = async (
    key: number,
    file: File
  ): Promise<boolean> => {
    // Start playback with Tone.js and load the sound if it hasn't been loaded
    if (
      !userMedia.current.audio?.audioEffects.fgBackgroundMusic.importedPlayers[
        key
      ]
    ) {
      await userMedia.current.audio?.audioEffects.fgBackgroundMusic.loadImportedBackgroundMusic(
        key,
        file
      );
    }

    return (
      userMedia.current.audio?.audioEffects.fgBackgroundMusic.toggleImportedAudio(
        key,
        false
      ) ?? false
    );
  };

  const toggleImportedAudio = async (key: number) => {
    let succeeded = false;

    const { file, playing } = importedFiles[key];
    if (playing) {
      // Stop playback
      succeeded =
        userMedia.current.audio?.audioEffects.fgBackgroundMusic.toggleImportedAudio(
          key,
          true
        ) ?? false;
    } else {
      succeeded = await playImportedAudio(key, file);
    }

    if (succeeded) {
      setImportedFiles((prevFiles) => {
        const importedFile = prevFiles[key];
        const { playing } = importedFile;

        if (playing) {
          return {
            ...prevFiles,
            [key]: {
              ...importedFile,
              playing: false,
            },
          };
        } else {
          return {
            ...prevFiles,
            [key]: {
              ...importedFile,
              playing: true,
            },
          };
        }
      });
    }
  };

  return (
    <FgPanel
      content={
        <div ref={backgroundMusicContainerRef} className='w-full h-full'>
          <input
            ref={fileSelectorRef}
            className='hidden'
            type='file'
            onChange={handleFileInput}
            multiple
          />
          <div
            ref={backgroundMusicScrollingContainerRef}
            className={`small-vertical-scroll-bar overflow-y-auto py-2 w-full h-full grid gap-1 items-center justify-center justify-items-center place-items-center ${
              cols === 3
                ? "grid-cols-3"
                : cols === 4
                ? "grid-cols-4"
                : cols === 5
                ? "grid-cols-5"
                : "grid-cols-6"
            }`}
          >
            <FgButton
              contentFunction={() => (
                <div className='bg-white flex items-center justify-center min-w-12 max-w-24 aspect-square rounded border-2 border-fg-black-35 border-opacity-75 hover:border-3 hover:border-fg-secondary hover:border-opacity-100'>
                  <FgSVG
                    src={additionIcon}
                    attributes={[
                      { key: "width", value: "100%" },
                      { key: "height", value: "100%" },
                      { key: "fill", value: "black" },
                      { key: "stroke", value: "black" },
                    ]}
                  />
                </div>
              )}
              pointerDownFunction={handleImportEffectClickDown}
              hoverContent={
                <FgHoverContentStandard content='Import background music' />
              }
              scrollingContainerRef={backgroundMusicScrollingContainerRef}
            />
            {Object.entries(importedFiles).map(
              ([key, file]) =>
                file && (
                  <FgButton
                    key={key}
                    clickFunction={() => toggleImportedAudio(parseInt(key))}
                    contentFunction={() => (
                      <div
                        className={`${
                          file.playing
                            ? "border-3 border-fg-secondary border-opacity-100"
                            : "border-2 border-fg-black-35 border-opacity-75"
                        } font-K2D text-3xl bg-white flex items-center justify-center min-w-12 max-w-24 aspect-square rounded hover:border-3 hover:border-fg-secondary hover:border-opacity-100`}
                      >
                        {key}
                      </div>
                    )}
                    hoverContent={
                      <FgHoverContentStandard content={file.file.name} />
                    }
                    scrollingContainerRef={backgroundMusicScrollingContainerRef}
                    options={{
                      hoverZValue: 999999999999999,
                      hoverTimeoutDuration: 750,
                    }}
                  />
                )
            )}
            {Object.entries(backgroundMusic).map(([key, effect]) => (
              <FgButton
                key={key}
                clickFunction={() => toggleAudio(key as BackgroundMusicTypes)}
                contentFunction={() => (
                  <div
                    className={`${
                      effect.playing
                        ? "border-3 border-fg-secondary bg-opacity-100"
                        : effect.bgColor === "white"
                        ? "border-2 border-fg-black-35 border-opacity-75"
                        : "border-2 border-white border-opacity-75"
                    } ${effect.bgColor === "white" ? "bg-white" : ""} ${
                      effect.bgColor === "black" ? "bg-black" : ""
                    } flex items-center justify-center min-w-12 max-w-24 aspect-square rounded hover:border-3 hover:border-fg-secondary hover:bg-opacity-100`}
                    data-background-music-effects-button-value={key}
                  >
                    {effect.image ? (
                      <FgImageElement
                        src={effect.image}
                        srcLoading={effect.imageSmall}
                        alt={key}
                        style={{ width: "100%", height: "100%" }}
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
                  <FgHoverContentStandard
                    content={backgroundMusicLabels[key as BackgroundMusicTypes]}
                  />
                }
                scrollingContainerRef={backgroundMusicScrollingContainerRef}
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
      initWidth={"278px"}
      initHeight={"264px"}
      minWidth={204}
      minHeight={190}
      closeCallback={closeCallback}
      closePosition='topRight'
      shadow={{ bottom: true, top: true }}
      resizeCallback={gridColumnsChange}
    />
  );
}
