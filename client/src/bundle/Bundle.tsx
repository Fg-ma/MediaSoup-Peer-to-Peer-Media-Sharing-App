import React, { Suspense, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useCurrentEffectsStylesContext } from "../context/CurrentEffectsStylesContext";
import { AudioEffectTypes, useStreamsContext } from "../context/StreamsContext";
import BundleController from "./lib/BundleController";
import { useSignalContext } from "../context/SignalContext";

const FgVideo = React.lazy(() => import("../fgVideo/FgVideo"));
const FgAudioElementContainer = React.lazy(
  () => import("../fgAudioElement/FgAudioElementContainer")
);

interface BundleOptions {
  isUser?: boolean;
  acceptsCameraEffects?: boolean;
  acceptsScreenEffects?: boolean;
  acceptsAudioEffects?: boolean;
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
  initialVolume?: "off" | "low" | "high";
}

const defaultBundleOptions = {
  isUser: false,
  acceptsCameraEffects: false,
  acceptsScreenEffects: false,
  acceptsAudioEffects: false,
  primaryVolumeSliderColor: "white",
  secondaryVolumeSliderColor: "rgba(150, 150, 150, 0.5)",
};

export default function Bundle({
  socket,
  table_id,
  username,
  instance,
  name,
  initCameraStreams,
  initScreenStreams,
  initAudioStream,
  options,
  handleMuteCallback,
  onRendered,
  onNewConsumerWasCreatedCallback,
}: {
  socket: React.MutableRefObject<Socket>;
  table_id: string;
  username: string;
  instance: string;
  name?: string;
  initCameraStreams?: { [cameraKey: string]: MediaStream };
  initScreenStreams?: { [screenKey: string]: MediaStream };
  initAudioStream?: MediaStream;
  options?: BundleOptions;
  handleMuteCallback?: () => any;
  onRendered?: () => any;
  onNewConsumerWasCreatedCallback?: () => any;
}) {
  const bundleOptions = {
    ...defaultBundleOptions,
    ...options,
  };

  const { userMedia, remoteTracksMap, remoteStreamEffects } =
    useStreamsContext();
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();
  const { signal } = useSignalContext();

  const [cameraStreams, setCameraStreams] = useState<
    | {
        [screenKey: string]: MediaStream;
      }
    | undefined
  >(initCameraStreams);
  const [screenStreams, setScreenStreams] = useState<
    | {
        [screenKey: string]: MediaStream;
      }
    | undefined
  >(initScreenStreams);
  const [audioStream, setAudioStream] = useState<MediaStream | undefined>(
    initAudioStream
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const bundleRef = useRef<HTMLDivElement>(null);

  const clientMute = useRef(false); // User audio mute
  const localMute = useRef(false); // Not user audio mute

  const [acceptsCameraEffects, setAcceptsCameraEffects] = useState(
    bundleOptions.acceptsCameraEffects
  );
  const [acceptsScreenEffects, setAcceptsScreenEffects] = useState(
    bundleOptions.acceptsScreenEffects
  );
  const [acceptsAudioEffects, setAcceptsAudioEffects] = useState(
    bundleOptions.acceptsAudioEffects
  );

  const handleAudioEffectChange = (effect: AudioEffectTypes) => {
    if (bundleOptions.isUser) {
      userMedia.current.audio?.changeEffects(effect, false);

      if (acceptsAudioEffects) {
        const msg = {
          type: "clientEffectChange",
          table_id: table_id,
          username: username,
          instance: instance,
          producerType: "audio",
          producerId: undefined,
          effect: effect,
          // @ts-ignore
          effectStyle: currentEffectsStyles.current.audio[effect],
          blockStateChange: false,
        };
        socket.current.emit("message", msg);
      }
    } else if (acceptsAudioEffects) {
      const msg = {
        type: "requestEffectChange",
        table_id: table_id,
        requestedUsername: username,
        requestedInstance: instance,
        requestedProducerType: "audio",
        requestedProducerId: undefined,
        effect: effect,
        effectStyle:
          // @ts-ignore
          remoteCurrentEffectsStyles.current[username][instance].audio[effect],
        blockStateChange: false,
      };

      socket.current.emit("message", msg);
    }
  };

  const bundleController = new BundleController(
    bundleOptions.isUser,
    username,
    instance,
    setCameraStreams,
    setScreenStreams,
    setAudioStream,
    remoteTracksMap,
    remoteStreamEffects,
    currentEffectsStyles,
    remoteCurrentEffectsStyles,
    userMedia,
    audioRef,
    clientMute,
    localMute,
    acceptsAudioEffects,
    setAcceptsCameraEffects,
    setAcceptsScreenEffects,
    setAcceptsAudioEffects,
    handleAudioEffectChange,
    onNewConsumerWasCreatedCallback
  );

  // Initial functions & call onRendered call back if one is availiable
  useEffect(() => {
    if (onRendered) {
      onRendered();
    }

    socket.current.on("message", (event) =>
      bundleController.handleMessage(event)
    );

    // Cleanup event listener on unmount
    return () => {
      socket.current.off("message", (event) =>
        bundleController.handleMessage(event)
      );
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && audioStream && !bundleOptions.isUser) {
      audioRef.current.srcObject = audioStream;
    } else if (
      audioRef.current &&
      userMedia.current.audio &&
      bundleOptions.isUser
    ) {
      const samplerStream = new MediaStream([
        userMedia.current.audio.getSamplerTrack(),
      ]);
      audioRef.current.srcObject = samplerStream;
    }
  }, [audioRef, audioStream]);

  const tracksColorSetterCallback = () => {
    if (!bundleRef.current || !audioRef.current) {
      return;
    }

    const volumeSliders = bundleRef.current.querySelectorAll(".volume-slider");

    let value = audioRef.current.volume;
    if (
      audioRef.current.muted &&
      !bundleOptions.isUser &&
      !clientMute.current
    ) {
      value = 0;
    }
    const min = 0;
    const max = 1;
    const percentage = ((value - min) / (max - min)) * 100;
    const trackColor = `linear-gradient(to right, ${bundleOptions.primaryVolumeSliderColor} 0%, ${bundleOptions.primaryVolumeSliderColor} ${percentage}%, ${bundleOptions.secondaryVolumeSliderColor} ${percentage}%, ${bundleOptions.secondaryVolumeSliderColor} 100%)`;

    volumeSliders.forEach((slider) => {
      const sliderElement = slider as HTMLInputElement;
      sliderElement.style.background = trackColor;
    });
  };

  const handleVolumeSliderCallback = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const volume = parseFloat(event.target.value);

    if (bundleRef.current) {
      const volumeSliders =
        bundleRef.current.querySelectorAll(".volume-slider");

      volumeSliders.forEach((slider) => {
        const sliderElement = slider as HTMLInputElement;
        sliderElement.value = `${volume}`;
      });
    }

    tracksColorSetterCallback();
  };

  const handleMute = () => {
    if (handleMuteCallback) {
      handleMuteCallback();
    }

    if (clientMute.current) {
      return;
    }

    localMute.current = !localMute.current;

    if (audioRef.current && !bundleOptions.isUser) {
      audioRef.current.muted = localMute.current;
    }
  };

  useEffect(() => {
    if (!signal) {
      return;
    }

    switch (signal.type) {
      case "localMuteChange":
        if (
          signal.table_id === table_id &&
          signal.username === username &&
          signal.instance === instance
        ) {
          bundleController.bundleSocket.onLocalMuteChange();
        }
        break;
      default:
        break;
    }
  }, [signal]);

  return (
    <div
      ref={bundleRef}
      id={`${username}_bundle_container`}
      className='bundle-container'
    >
      {cameraStreams &&
        Object.keys(cameraStreams).length !== 0 &&
        Object.entries(cameraStreams).map(([key, cameraStream]) => (
          <Suspense key={key} fallback={<div>Loading...</div>}>
            <FgVideo
              socket={socket}
              videoId={key}
              table_id={table_id}
              username={username}
              instance={instance}
              name={name}
              type='camera'
              bundleRef={bundleRef}
              videoStream={cameraStream}
              audioStream={audioStream}
              audioRef={audioRef}
              handleAudioEffectChange={handleAudioEffectChange}
              clientMute={clientMute}
              localMute={localMute}
              options={{
                isUser: bundleOptions.isUser,
                acceptsVisualEffects: acceptsCameraEffects,
                acceptsAudioEffects: acceptsAudioEffects,
                isStream: true,
                flipVideo: true,
                isSlider: !bundleOptions.isUser,
                isVolume: audioStream ? true : false,
                isTotalTime: false,
                isPlaybackSpeed: false,
                isClosedCaptions: true,
                isTimeLine: false,
                isSkip: false,
                isThumbnail: false,
                isPreview: false,
                initialVolume: bundleOptions.initialVolume
                  ? bundleOptions.initialVolume
                  : audioRef.current
                  ? audioRef.current.muted
                    ? "off"
                    : audioRef.current.volume > 0.5
                    ? "high"
                    : "low"
                  : "high",
              }}
              handleMute={handleMute}
              handleMuteCallback={handleMuteCallback}
              handleVolumeSliderCallback={handleVolumeSliderCallback}
              tracksColorSetterCallback={tracksColorSetterCallback}
            />
          </Suspense>
        ))}
      {screenStreams &&
        Object.keys(screenStreams).length !== 0 &&
        Object.entries(screenStreams).map(([key, screenStream]) => (
          <Suspense key={key} fallback={<div>Loading...</div>}>
            <FgVideo
              socket={socket}
              videoId={key}
              table_id={table_id}
              username={username}
              instance={instance}
              name={name}
              type='screen'
              bundleRef={bundleRef}
              videoStream={screenStream}
              audioStream={audioStream}
              audioRef={audioRef}
              handleAudioEffectChange={handleAudioEffectChange}
              clientMute={clientMute}
              localMute={localMute}
              options={{
                isUser: bundleOptions.isUser,
                acceptsVisualEffects: acceptsScreenEffects,
                acceptsAudioEffects: acceptsAudioEffects,
                isStream: true,
                isSlider: !bundleOptions.isUser,
                isVolume: audioStream ? true : false,
                isTotalTime: false,
                isPlaybackSpeed: false,
                isClosedCaptions: true,
                isTimeLine: false,
                isSkip: false,
                isThumbnail: false,
                isPreview: false,
                initialVolume: bundleOptions.initialVolume
                  ? bundleOptions.initialVolume
                  : audioRef.current
                  ? audioRef.current.muted
                    ? "off"
                    : audioRef.current.volume > 0.5
                    ? "high"
                    : "low"
                  : "high",
              }}
              handleMute={handleMute}
              handleMuteCallback={handleMuteCallback}
              handleVolumeSliderCallback={handleVolumeSliderCallback}
              tracksColorSetterCallback={tracksColorSetterCallback}
            />
          </Suspense>
        ))}
      {audioStream &&
        Object.keys(cameraStreams || {}).length === 0 &&
        Object.keys(screenStreams || {}).length === 0 && (
          <Suspense fallback={<div>Loading...</div>}>
            <FgAudioElementContainer
              socket={socket}
              username={username}
              instance={instance}
              name={name}
              audioStream={audioStream}
              audioRef={audioRef}
              handleAudioEffectChange={handleAudioEffectChange}
              handleMute={handleMute}
              localMute={localMute}
              isUser={bundleOptions.isUser}
              clientMute={clientMute}
            />
          </Suspense>
        )}
      <audio
        ref={audioRef}
        id={`${username}_audio_stream`}
        className='w-0 z-0'
        autoPlay={true}
      ></audio>
    </div>
  );
}
