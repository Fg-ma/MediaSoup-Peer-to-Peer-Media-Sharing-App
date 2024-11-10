import React, { Suspense, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useCurrentEffectsStylesContext } from "../context/currentEffectsStylesContext/CurrentEffectsStylesContext";
import { useStreamsContext } from "../context/streamsContext/StreamsContext";
import BundleController from "./lib/BundleController";
import { useSignalContext } from "../context/signalContext/SignalContext";
import FgBabylonCanvas from "../fgBabylonCanvas/FgBabylonCanvas";
import { BundleOptions, defaultBundleOptions } from "./lib/typeConstant";

const FgVideo = React.lazy(() => import("../fgVideo/FgVideo"));
const FgAudioElementContainer = React.lazy(
  () => import("../fgAudioElement/FgAudioElementContainer")
);

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
  handleMuteCallback?: () => void;
  onRendered?: () => void;
  onNewConsumerWasCreatedCallback?: () => void;
}) {
  const bundleOptions = {
    ...defaultBundleOptions,
    ...options,
  };

  const { userMedia, remoteTracksMap, remoteStreamEffects } =
    useStreamsContext();
  const { remoteCurrentEffectsStyles } = useCurrentEffectsStylesContext();
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

  const bundleController = new BundleController(
    bundleOptions.isUser,
    table_id,
    username,
    instance,
    socket,
    bundleOptions,
    setCameraStreams,
    setScreenStreams,
    setAudioStream,
    remoteTracksMap,
    remoteStreamEffects,
    remoteCurrentEffectsStyles,
    userMedia,
    bundleRef,
    audioRef,
    clientMute,
    localMute,
    acceptsAudioEffects,
    setAcceptsCameraEffects,
    setAcceptsScreenEffects,
    setAcceptsAudioEffects,
    onNewConsumerWasCreatedCallback,
    handleMuteCallback
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
      className='bundle-container w-max h-max'
    >
      {cameraStreams &&
        Object.keys(cameraStreams).length !== 0 &&
        Object.entries(cameraStreams).map(([key, cameraStream]) => (
          <Suspense key={key} fallback={<div>Loading...</div>}>
            {bundleOptions.isUser ? (
              <FgBabylonCanvas
                socket={socket}
                videoId={key}
                table_id={table_id}
                username={username}
                instance={instance}
                name={name}
                type='camera'
                bundleRef={bundleRef}
                audioStream={audioStream}
                audioRef={audioRef}
                handleAudioEffectChange={
                  bundleController.handleAudioEffectChange
                }
                clientMute={clientMute}
                localMute={localMute}
                options={{
                  isUser: bundleOptions.isUser,
                  acceptsVisualEffects: acceptsCameraEffects,
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
                handleMute={bundleController.handleMute}
                handleMuteCallback={handleMuteCallback}
                handleVolumeSliderCallback={
                  bundleController.handleVolumeSliderCallback
                }
                tracksColorSetterCallback={
                  bundleController.tracksColorSetterCallback
                }
              />
            ) : (
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
                handleAudioEffectChange={
                  bundleController.handleAudioEffectChange
                }
                clientMute={clientMute}
                localMute={localMute}
                options={{
                  isUser: bundleOptions.isUser,
                  acceptsVisualEffects: acceptsCameraEffects,
                  acceptsAudioEffects: acceptsAudioEffects,
                  isStream: true,
                  isSlider: !bundleOptions.isUser,
                  isVolume: audioStream ? true : false,
                  isClosedCaptions: true,
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
                handleMute={bundleController.handleMute}
                handleMuteCallback={handleMuteCallback}
                handleVolumeSliderCallback={
                  bundleController.handleVolumeSliderCallback
                }
                tracksColorSetterCallback={
                  bundleController.tracksColorSetterCallback
                }
              />
            )}
          </Suspense>
        ))}
      {screenStreams &&
        Object.keys(screenStreams).length !== 0 &&
        Object.entries(screenStreams).map(([key, screenStream]) => (
          <Suspense key={key} fallback={<div>Loading...</div>}>
            {bundleOptions.isUser ? (
              <FgBabylonCanvas
                socket={socket}
                videoId={key}
                table_id={table_id}
                username={username}
                instance={instance}
                name={name}
                type='screen'
                bundleRef={bundleRef}
                audioStream={audioStream}
                audioRef={audioRef}
                handleAudioEffectChange={
                  bundleController.handleAudioEffectChange
                }
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
                handleMute={bundleController.handleMute}
                handleMuteCallback={handleMuteCallback}
                handleVolumeSliderCallback={
                  bundleController.handleVolumeSliderCallback
                }
                tracksColorSetterCallback={
                  bundleController.tracksColorSetterCallback
                }
              />
            ) : (
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
                handleAudioEffectChange={
                  bundleController.handleAudioEffectChange
                }
                clientMute={clientMute}
                localMute={localMute}
                options={{
                  isUser: bundleOptions.isUser,
                  acceptsVisualEffects: acceptsScreenEffects,
                  acceptsAudioEffects: acceptsAudioEffects,
                  isStream: true,
                  isSlider: !bundleOptions.isUser,
                  isVolume: audioStream ? true : false,
                  isClosedCaptions: true,
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
                handleMute={bundleController.handleMute}
                handleMuteCallback={handleMuteCallback}
                handleVolumeSliderCallback={
                  bundleController.handleVolumeSliderCallback
                }
                tracksColorSetterCallback={
                  bundleController.tracksColorSetterCallback
                }
              />
            )}
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
              handleAudioEffectChange={bundleController.handleAudioEffectChange}
              handleMute={bundleController.handleMute}
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
