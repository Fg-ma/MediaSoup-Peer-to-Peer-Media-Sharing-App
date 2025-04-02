import React, { useRef, useState } from "react";
import FgPanel from "../elements/fgPanel/FgPanel";
import FgButton from "../elements/fgButton/FgButton";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { BackgroundMusicTypes } from "../../../universal/effectsTypeConstant";
import FgImageElement from "../elements/fgImageElement/FgImageElement";
import FgSVGElement from "../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../elements/fgHoverContentStandard/FgHoverContentStandard";
import { backgroundMusicStatic } from "./lib/typeConstant";
import LazyScrollingContainer from "../elements/lazyScrollingContainer/LazyScrollingContainer";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";

export default function FgBackgroundMusicPortal({
  closeCallback,
  backgroundMusicButtonRef,
}: {
  closeCallback: () => void;
  backgroundMusicButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const { userMedia } = useMediaContext();

  const [backgroundMusic, setBackgroundMusic] = useState<{
    [backgroundMusicType in BackgroundMusicTypes]: boolean;
  }>({
    adventureTime: false,
    bottledNoise: false,
    cacophony: false,
    cafeMusic: false,
    drumBeat: false,
    drunkOnFunk: false,
    findingHome: false,
    funk: false,
    futureSkies: false,
    hardRock: false,
    harmonica: false,
    highEnergyRock: false,
    lofi1: false,
    lofi2: false,
    mischief: false,
    money: false,
    motions: false,
    niceBeat: false,
    outWest: false,
    phonk: false,
    piano: false,
    reggae: false,
    retroGame: false,
    riskItAll: false,
    royalProcession: false,
    smoothRock: false,
    space: false,
    spookyPiano: false,
    stompingRock: false,
    ukulele: false,
    wacky: false,
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

    const playing = backgroundMusic[backgroundMusicType];
    const path = backgroundMusicStatic[backgroundMusicType].path;
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
      setBackgroundMusic((prevEffects) => ({
        ...prevEffects,
        [backgroundMusicType]: !prevEffects[backgroundMusicType],
      }));
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
          <LazyScrollingContainer
            externalRef={backgroundMusicScrollingContainerRef}
            className={`small-vertical-scroll-bar overflow-y-auto py-2 w-full h-full grid gap-1 items-center justify-center justify-items-center place-items-center ${
              cols === 3
                ? "grid-cols-3"
                : cols === 4
                ? "grid-cols-4"
                : cols === 5
                ? "grid-cols-5"
                : "grid-cols-6"
            }`}
            items={[
              <FgButton
                contentFunction={() => (
                  <div className='flex bg-white items-center justify-center min-w-12 max-w-24 aspect-square rounded border-2 border-fg-red-dark border-opacity-75 hover:border-3 hover:border-fg-red-light hover:border-opacity-100'>
                    <FgSVGElement
                      src={additionIcon}
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                        { key: "fill", value: "#e80110" },
                        { key: "stroke", value: "#e80110" },
                      ]}
                    />
                  </div>
                )}
                pointerDownFunction={handleImportEffectClickDown}
                hoverContent={
                  <FgHoverContentStandard content='Import background music' />
                }
                scrollingContainerRef={backgroundMusicScrollingContainerRef}
              />,
              ...Object.entries(importedFiles).map(
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
                      scrollingContainerRef={
                        backgroundMusicScrollingContainerRef
                      }
                      options={{
                        hoverZValue: 999999999999999,
                        hoverTimeoutDuration: 750,
                      }}
                    />
                  )
              ),
              ...Object.entries(backgroundMusic).map(([key, playing]) => (
                <FgButton
                  key={key}
                  clickFunction={() => toggleAudio(key as BackgroundMusicTypes)}
                  contentFunction={() => (
                    <div
                      className={`${
                        playing
                          ? "border-3 border-fg-secondary bg-opacity-100"
                          : backgroundMusicStatic[key as BackgroundMusicTypes]
                              .bgColor === "white"
                          ? "border-2 border-fg-black-35 border-opacity-75"
                          : "border-2 border-fg-white border-opacity-75"
                      } ${
                        backgroundMusicStatic[key as BackgroundMusicTypes]
                          .bgColor === "white"
                          ? "bg-fg-white"
                          : ""
                      } ${
                        backgroundMusicStatic[key as BackgroundMusicTypes]
                          .bgColor === "black"
                          ? "bg-black"
                          : ""
                      } flex items-center justify-center min-w-12 max-w-24 aspect-square rounded hover:border-3 hover:border-fg-secondary hover:bg-opacity-100`}
                      data-background-music-effects-button-value={key}
                    >
                      {backgroundMusicStatic[key as BackgroundMusicTypes]
                        .image ? (
                        <FgImageElement
                          src={
                            backgroundMusicStatic[key as BackgroundMusicTypes]
                              .image!
                          }
                          srcLoading={
                            backgroundMusicStatic[key as BackgroundMusicTypes]
                              .imageSmall
                          }
                          alt={key}
                          style={{ width: "100%", height: "100%" }}
                          data-background-music-effects-button-value={key}
                        />
                      ) : (
                        <FgSVGElement
                          src={
                            backgroundMusicStatic[key as BackgroundMusicTypes]
                              .icon ?? ""
                          }
                          attributes={[
                            { key: "width", value: "100%" },
                            { key: "height", value: "100%" },
                            { key: "fill", value: "#f2f2f2" },
                            { key: "stroke", value: "#f2f2f2" },
                          ]}
                          data-background-music-effects-button-value={key}
                        />
                      )}
                    </div>
                  )}
                  hoverContent={
                    <FgHoverContentStandard
                      content={
                        backgroundMusicStatic[key as BackgroundMusicTypes].label
                      }
                    />
                  }
                  scrollingContainerRef={backgroundMusicScrollingContainerRef}
                  options={{
                    hoverZValue: 999999999999999,
                    hoverTimeoutDuration: 750,
                  }}
                />
              )),
            ]}
          />
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
