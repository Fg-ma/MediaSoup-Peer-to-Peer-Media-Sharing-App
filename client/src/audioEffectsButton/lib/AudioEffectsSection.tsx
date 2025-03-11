import React, { useState, useEffect, useRef, Suspense } from "react";
import { Permissions } from "../../context/permissionsContext/typeConstant";
import { AudioEffectTypes } from "../../context/effectsContext/typeConstant";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import FgPanel from "../../elements/fgPanel/FgPanel";
import FgButton from "../../elements/fgButton/FgButton";
import FgSVG from "../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../elements/fgHoverContentStandard/FgHoverContentStandard";
import AudioEffectButton from "./AudioEffectButton";
import FgBackgroundMusicPortal from "../../fgBackgroundMusicPortal/FgBackgroundMusicPortal";
import { audioEffectTemplates } from "./typeConstant";
import { IncomingMediasoupMessages } from "../../serverControllers/mediasoupServer/lib/typeConstant";
import LazyScrollingContainer from "../../elements/lazyScrollingContainer/LazyScrollingContainer";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

import VolumeSVG from "../../fgVolumeElement/lib/VolumeSVG";
import volumeSVGPaths from "../../fgVolumeElement/lib/volumeSVGPaths";

const mixAudioEffectsIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/mixAudioEffectsIcon.svg";
const mixAudioEffectsOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/mixAudioEffectsOffIcon.svg";
const pianoIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/pianoIcon.svg";
const pianoOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/pianoOffIcon.svg";
const soundBoardIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/soundBoardIcon.svg";
const soundBoardOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/soundBoardOffIcon.svg";
const backgroundMusicIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/backgroundMusicIcon.svg";
const backgroundMusicOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/backgroundMusicOffIcon.svg";

const AudioMixEffectsPortal = React.lazy(
  () => import("./AudioMixEffectsPortal")
);
const FgPiano = React.lazy(() => import("../../components/fgPiano/FgPiano"));
const FgSoundBoard = React.lazy(
  () => import("../../components/fgSoundBoard/FgSoundBoard")
);

export default function AudioEffectsSection({
  externalRef,
  table_id,
  username,
  instance,
  isUser,
  permissions,
  producerType,
  producerId,
  handleAudioEffectChange,
  placement,
  referenceElement,
  padding,
  handleMute,
  muteStateRef,
  videoContentMute,
  clientMute,
  screenAudioClientMute,
  localMute,
  screenAudioLocalMute,
  visualMediaContainerRef,
  closeLabelElement,
  closeCallback,
  backgroundColor,
  secondaryBackgroundColor,
  items,
}: {
  externalRef?: React.RefObject<HTMLDivElement>;
  table_id: string;
  username: string;
  instance: string;
  isUser: boolean;
  permissions: Permissions | undefined;
  producerType: "audio" | "screenAudio" | "video";
  producerId: string | undefined;
  handleAudioEffectChange: (
    producerType: "audio" | "screenAudio" | "video",
    producerId: string | undefined,
    effect: AudioEffectTypes
  ) => void;
  placement: "above" | "below" | "left" | "right";
  referenceElement: React.RefObject<HTMLElement>;
  padding: number;
  handleMute: (
    producerType: "audio" | "screenAudio" | "video",
    producerId: string | undefined
  ) => void;
  muteStateRef?: React.MutableRefObject<boolean>;
  videoContentMute?: React.MutableRefObject<{
    [producerId: string]: boolean;
  }>;
  clientMute?: React.MutableRefObject<boolean>;
  screenAudioClientMute?: React.MutableRefObject<{
    [screenAudioId: string]: boolean;
  }>;
  localMute?: React.MutableRefObject<boolean>;
  screenAudioLocalMute?: React.MutableRefObject<{
    [screenAudioId: string]: boolean;
  }>;
  visualMediaContainerRef?: React.RefObject<HTMLDivElement>;
  closeLabelElement?: React.ReactElement;
  closeCallback?: () => void;
  backgroundColor?: string;
  secondaryBackgroundColor?: string;
  items?: React.ReactElement[];
}) {
  const { mediasoupSocket } = useSocketContext();

  const [_, setRerender] = useState(false);
  const [cols, setCols] = useState(3);
  // No one in there right mind will ever be able to read this again and I'm ok with that
  const [volumeState, setVolumeState] = useState<{
    from: "off" | "low" | "high" | "";
    to: "off" | "low" | "high";
  }>({
    from: "",
    to: muteStateRef
      ? muteStateRef.current
        ? "off"
        : "high"
      : producerType === "video" && videoContentMute && producerId
      ? videoContentMute.current[producerId]
        ? "off"
        : "high"
      : producerType === "audio" && clientMute
      ? clientMute.current
        ? "off"
        : localMute
        ? localMute.current
          ? "off"
          : "high"
        : "high"
      : producerType === "screenAudio" && screenAudioClientMute && producerId
      ? screenAudioClientMute.current[producerId]
        ? "off"
        : screenAudioLocalMute
        ? screenAudioLocalMute.current[producerId]
          ? "off"
          : "high"
        : "high"
      : producerType === "audio" && localMute
      ? localMute.current
        ? "off"
        : "high"
      : producerType === "screenAudio" && screenAudioLocalMute && producerId
      ? screenAudioLocalMute.current[producerId]
        ? "off"
        : "high"
      : "high",
  });
  const [audioMixEffectsActive, setAudioMixEffectsActive] = useState(false);
  const [panioActive, setPanioActive] = useState(false);
  const [soundBoardActive, setSoundBoardActive] = useState(false);
  const [backgroundMusicActive, setBackgroundMusicActive] = useState(false);

  const audioSectionRef = externalRef
    ? externalRef
    : useRef<HTMLDivElement>(null);
  const audioMixEffectsButtonRef = useRef<HTMLButtonElement>(null);
  const pianoRef = useRef<HTMLButtonElement>(null);
  const soundBoardButtonRef = useRef<HTMLButtonElement>(null);
  const backgroundMusicButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const newTo = muteStateRef
      ? muteStateRef.current
        ? "off"
        : "high"
      : producerType === "video" && videoContentMute && producerId
      ? videoContentMute.current[producerId]
        ? "off"
        : "high"
      : producerType === "audio" && clientMute
      ? clientMute.current
        ? "off"
        : localMute
        ? localMute.current
          ? "off"
          : "high"
        : "high"
      : producerType === "screenAudio" && screenAudioClientMute && producerId
      ? screenAudioClientMute.current[producerId]
        ? "off"
        : screenAudioLocalMute
        ? screenAudioLocalMute.current[producerId]
          ? "off"
          : "high"
        : "high"
      : producerType === "audio" && localMute
      ? localMute.current
        ? "off"
        : "high"
      : producerType === "screenAudio" && screenAudioLocalMute && producerId
      ? screenAudioLocalMute.current[producerId]
        ? "off"
        : "high"
      : "high";

    if (newTo !== volumeState.to) {
      setVolumeState((prev) => ({ from: prev.to, to: newTo }));
    }
  }, [
    muteStateRef?.current,
    videoContentMute?.current,
    clientMute?.current,
    localMute?.current,
    screenAudioClientMute?.current[producerId ?? ""],
    screenAudioLocalMute?.current[producerId ?? ""],
  ]);

  const gridColumnsChange = () => {
    if (!audioSectionRef.current) return;

    const width = audioSectionRef.current.clientWidth;
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

  const handleMessage = (event: IncomingMediasoupMessages) => {
    switch (event.type) {
      case "effectChangeRequested":
        setRerender((prev) => !prev);
        break;
      case "clientEffectChanged":
        setRerender((prev) => !prev);
        break;
      case "clientMuteChange":
        setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    mediasoupSocket.current?.addMessageListener(handleMessage);

    return () => {
      mediasoupSocket.current?.removeMessageListener(handleMessage);
    };
  }, []);

  const audioEffectChange = (effect: AudioEffectTypes) => {
    handleAudioEffectChange(producerType, producerId, effect);

    setRerender((prev) => !prev);
  };

  const closeSoundBoardCallback = () => {
    setSoundBoardActive(false);
  };

  const closeBackgroundMusicCallback = () => {
    setBackgroundMusicActive(false);
  };

  return (
    <>
      <FgPanel
        content={
          <LazyScrollingContainer
            externalRef={audioSectionRef}
            className={`small-vertical-scroll-bar grid gap-1 min-w-[9.5rem] min-h-[9.5rem] h-full w-full overflow-y-auto py-2 ${
              cols === 3
                ? "grid-cols-3"
                : cols === 4
                ? "grid-cols-4"
                : cols === 5
                ? "grid-cols-5"
                : "grid-cols-6"
            }`}
            items={[
              ...(items ? items : []),
              <FgButton
                scrollingContainerRef={audioSectionRef}
                className='flex border-fg-off-white items-center justify-center min-w-12 w-full aspect-square hover:border-fg-red-light rounded border-2 hover:border-3 bg-fg-tone-black-4'
                clickFunction={() => {
                  handleMute(producerType, producerId);
                  setRerender((prev) => !prev);
                }}
                contentFunction={() => (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 100.0001 100.00001'
                    width='90%'
                    height='90%'
                    fill='white'
                  >
                    <VolumeSVG
                      volumeState={volumeState}
                      movingPath={volumeSVGPaths.low.right}
                      stationaryPaths={[
                        volumeSVGPaths.high.left,
                        volumeSVGPaths.high.middle,
                      ]}
                      color='white'
                    />
                    {volumeState.from === "" && volumeState.to === "off" && (
                      <path d={volumeSVGPaths.strike} />
                    )}
                  </svg>
                )}
                hoverContent={
                  <FgHoverContentStandard
                    content={
                      muteStateRef
                        ? muteStateRef.current
                          ? "Unmute"
                          : "Mute"
                        : producerType === "video" &&
                          videoContentMute &&
                          producerId
                        ? videoContentMute.current[producerId]
                          ? "off"
                          : "high"
                        : producerType === "audio" && clientMute
                        ? clientMute.current
                          ? "Unmute"
                          : localMute
                          ? localMute.current
                            ? "Unmute"
                            : "Mute"
                          : "Mute"
                        : producerType === "screenAudio" &&
                          screenAudioClientMute &&
                          producerId
                        ? screenAudioClientMute.current[producerId]
                          ? "Unmute"
                          : screenAudioLocalMute
                          ? screenAudioLocalMute.current[producerId]
                            ? "Unmute"
                            : "Mute"
                          : "Mute"
                        : producerType === "audio" && localMute
                        ? localMute.current
                          ? "Unmute"
                          : "Mute"
                        : producerType === "screenAudio" &&
                          screenAudioLocalMute &&
                          producerId
                        ? screenAudioLocalMute.current[producerId]
                          ? "Unmute"
                          : "Mute"
                        : "Mute"
                    }
                  />
                }
                options={{
                  hoverTimeoutDuration: 750,
                  hoverZValue: 500000000000,
                }}
              />,
              <FgButton
                scrollingContainerRef={audioSectionRef}
                externalRef={audioMixEffectsButtonRef}
                className='flex border-fg-off-white items-center justify-center min-w-12 w-full aspect-square hover:border-fg-red-light rounded border-2 hover:border-3 bg-fg-tone-black-4'
                clickFunction={() => {
                  setAudioMixEffectsActive((prev) => !prev);
                }}
                contentFunction={() => {
                  return (
                    <FgSVG
                      src={
                        audioMixEffectsActive
                          ? mixAudioEffectsOffIcon
                          : mixAudioEffectsIcon
                      }
                      className='flex items-center justify-center'
                      attributes={[
                        { key: "width", value: "90%" },
                        { key: "height", value: "90%" },
                        { key: "fill", value: "#f2f2f2" },
                        { key: "stroke", value: "#f2f2f2" },
                      ]}
                    />
                  );
                }}
                hoverContent={
                  <FgHoverContentStandard
                    content={
                      audioMixEffectsActive
                        ? "Close mix effects"
                        : "Mix effects"
                    }
                  />
                }
                options={{
                  hoverTimeoutDuration: 750,
                  hoverZValue: 500000000000,
                }}
              />,
              isUser ? (
                <FgButton
                  scrollingContainerRef={audioSectionRef}
                  externalRef={pianoRef}
                  className='flex border-fg-off-white items-center justify-center min-w-12 w-full aspect-square hover:border-fg-red-light rounded border-2 hover:border-3 bg-fg-tone-black-4'
                  clickFunction={() => {
                    if (visualMediaContainerRef?.current) {
                      if (
                        visualMediaContainerRef.current.classList.contains(
                          "in-piano"
                        )
                      ) {
                        visualMediaContainerRef.current.classList.remove(
                          "in-piano"
                        );
                      } else {
                        visualMediaContainerRef.current.classList.add(
                          "in-piano"
                        );
                      }
                    }
                    setPanioActive((prev) => !prev);
                  }}
                  contentFunction={() => {
                    return (
                      <FgSVG
                        src={panioActive ? pianoOffIcon : pianoIcon}
                        className='flex items-center justify-center'
                        attributes={[
                          { key: "width", value: "90%" },
                          { key: "height", value: "90%" },
                          { key: "fill", value: "#f2f2f2" },
                          { key: "stroke", value: "#f2f2f2" },
                        ]}
                      />
                    );
                  }}
                  hoverContent={
                    <FgHoverContentStandard
                      content={panioActive ? "Close synth" : "Synth"}
                    />
                  }
                  options={{
                    hoverTimeoutDuration: 750,
                    hoverZValue: 500000000000,
                  }}
                />
              ) : null,
              isUser ? (
                <FgButton
                  scrollingContainerRef={audioSectionRef}
                  externalRef={soundBoardButtonRef}
                  className='flex border-fg-off-white items-center justify-center min-w-12 w-full aspect-square hover:border-fg-red-light rounded border-2 hover:border-3 bg-fg-tone-black-4'
                  clickFunction={() => {
                    setSoundBoardActive((prev) => !prev);
                  }}
                  contentFunction={() => {
                    return (
                      <FgSVG
                        src={
                          soundBoardActive ? soundBoardOffIcon : soundBoardIcon
                        }
                        className='flex items-center justify-center'
                        attributes={[
                          { key: "width", value: "90%" },
                          { key: "height", value: "90%" },
                          { key: "fill", value: "#f2f2f2" },
                          { key: "stroke", value: "#f2f2f2" },
                        ]}
                      />
                    );
                  }}
                  hoverContent={
                    <FgHoverContentStandard
                      content={
                        soundBoardActive ? "Close sound board" : "Sound board"
                      }
                    />
                  }
                  options={{
                    hoverTimeoutDuration: 750,
                    hoverZValue: 500000000000,
                  }}
                />
              ) : null,
              isUser ? (
                <FgButton
                  scrollingContainerRef={audioSectionRef}
                  externalRef={backgroundMusicButtonRef}
                  className='flex border-fg-off-white items-center justify-center min-w-12 w-full aspect-square hover:border-fg-red-light rounded border-2 hover:border-3 bg-fg-tone-black-4'
                  clickFunction={() => {
                    setBackgroundMusicActive((prev) => !prev);
                  }}
                  contentFunction={() => {
                    return (
                      <FgSVG
                        src={
                          backgroundMusicActive
                            ? backgroundMusicOffIcon
                            : backgroundMusicIcon
                        }
                        className='flex items-center justify-center'
                        attributes={[
                          { key: "width", value: "90%" },
                          { key: "height", value: "90%" },
                          { key: "fill", value: "#f2f2f2" },
                          { key: "stroke", value: "#f2f2f2" },
                        ]}
                      />
                    );
                  }}
                  hoverContent={
                    <FgHoverContentStandard
                      content={
                        backgroundMusicActive
                          ? "Close background music"
                          : "Background music"
                      }
                    />
                  }
                  options={{
                    hoverTimeoutDuration: 750,
                    hoverZValue: 500000000000,
                  }}
                />
              ) : null,
              ...Object.entries(audioEffectTemplates).map((effect) => (
                <AudioEffectButton
                  key={effect[0]}
                  username={username}
                  instance={instance}
                  isUser={isUser}
                  producerType={producerType}
                  producerId={producerId}
                  audioEffect={effect[0] as AudioEffectTypes}
                  audioEffectTemplate={effect[1]}
                  scrollingContainerRef={audioSectionRef}
                  handleAudioEffectChange={audioEffectChange}
                />
              )),
            ]}
          />
        }
        initPosition={{
          referenceElement: referenceElement.current ?? undefined,
          placement: placement,
          padding: padding,
        }}
        initWidth={"278px"}
        initHeight={"268px"}
        minWidth={204}
        minHeight={190}
        resizeCallback={gridColumnsChange}
        closeCallback={closeCallback ? () => closeCallback() : undefined}
        closeLabelElement={closeLabelElement}
        closePosition='topRight'
        shadow={{ top: true, bottom: true }}
        backgroundColor={backgroundColor}
        secondaryBackgroundColor={secondaryBackgroundColor}
      />
      {audioMixEffectsActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <AudioMixEffectsPortal
            table_id={table_id}
            username={username}
            instance={instance}
            producerType={producerType}
            producerId={producerId}
            isUser={isUser}
            permissions={permissions}
            audioMixEffectsButtonRef={audioMixEffectsButtonRef}
            closeCallback={() => {
              setAudioMixEffectsActive(false);
            }}
          />
        </Suspense>
      )}
      {panioActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <FgPiano
            isUser={isUser}
            closeCallback={() => {
              setPanioActive(false);
            }}
            referenceElement={pianoRef.current as HTMLElement}
          />
        </Suspense>
      )}
      {soundBoardActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <FgSoundBoard
            soundBoardButtonRef={soundBoardButtonRef.current ?? undefined}
            closeCallback={closeSoundBoardCallback}
          />
        </Suspense>
      )}
      {backgroundMusicActive && (
        <Suspense fallback={<div>Loading...</div>}>
          <FgBackgroundMusicPortal
            closeCallback={closeBackgroundMusicCallback}
            backgroundMusicButtonRef={backgroundMusicButtonRef}
          />
        </Suspense>
      )}
    </>
  );
}
