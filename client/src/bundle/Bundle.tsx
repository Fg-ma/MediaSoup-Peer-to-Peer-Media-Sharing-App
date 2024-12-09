import React, { Suspense, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useCurrentEffectsStylesContext } from "../context/currentEffectsStylesContext/CurrentEffectsStylesContext";
import { useStreamsContext } from "../context/streamsContext/StreamsContext";
import BundleController from "./lib/BundleController";
import { useSignalContext } from "../context/signalContext/SignalContext";
import { BundleOptions, defaultBundleOptions } from "./lib/typeConstant";
import { Permissions } from "../context/permissionsContext/PermissionsContext";

const UserVisualMedia = React.lazy(
  () => import("../fgVisualMedia/UserVisualMedia")
);
const RemoteVisualMedia = React.lazy(
  () => import("../fgVisualMedia/RemoteVisualMedia")
);
const FgAudioElementContainer = React.lazy(
  () => import("../fgAudioElement/FgAudioElementContainer")
);

export default function Bundle({
  socket,
  table_id,
  activeUsername,
  activeInstance,
  username,
  instance,
  name,
  initCameraStreams,
  initScreenStreams,
  initScreenAudioStreams,
  initAudioStream,
  options,
  handleMuteCallback,
  onRendered,
  onNewConsumerWasCreatedCallback,
}: {
  socket: React.MutableRefObject<Socket>;
  table_id: string;
  activeUsername: string | undefined;
  activeInstance: string | undefined;
  username: string;
  instance: string;
  name?: string;
  initCameraStreams?: { [cameraId: string]: MediaStream };
  initScreenStreams?: { [screenId: string]: MediaStream };
  initScreenAudioStreams?: { [screenAudioId: string]: MediaStream };
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
        [cameraId: string]: MediaStream;
      }
    | undefined
  >(initCameraStreams);
  const [screenStreams, setScreenStreams] = useState<
    | {
        [screenId: string]: MediaStream;
      }
    | undefined
  >(initScreenStreams);
  const [screenAudioStreams, setScreenAudioStreams] = useState<
    | {
        [screenAudioId: string]: MediaStream;
      }
    | undefined
  >(initScreenAudioStreams);
  const [audioStream, setAudioStream] = useState<MediaStream | undefined>(
    initAudioStream
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const bundleRef = useRef<HTMLDivElement>(null);

  const clientMute = useRef(false); // User audio mute
  const localMute = useRef(false); // Not user audio mute

  const [permissions, setPermissions] = useState<Permissions>(
    bundleOptions.permissions
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
    setScreenAudioStreams,
    setAudioStream,
    remoteTracksMap,
    remoteStreamEffects,
    remoteCurrentEffectsStyles,
    userMedia,
    bundleRef,
    audioRef,
    clientMute,
    localMute,
    permissions,
    setPermissions,
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
    if (!screenAudioStreams || !Object.values(screenAudioStreams)[0]) {
      return;
    }
    console.log(
      screenAudioStreams,
      Object.values(screenAudioStreams ?? {})[0],
      Object.values(screenAudioStreams ?? {})[0].getAudioTracks()
    );
  }, []);

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
      className='bundle-container w-full h-full relative'
    >
      {cameraStreams &&
        Object.keys(cameraStreams).length !== 0 &&
        Object.entries(cameraStreams).map(([key, cameraStream]) => (
          <Suspense key={key} fallback={<div>Loading...</div>}>
            {bundleOptions.isUser ? (
              <UserVisualMedia
                socket={socket}
                visualMediaId={key}
                table_id={table_id}
                activeUsername={activeUsername}
                activeInstance={activeInstance}
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
                  permissions: permissions,
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
            ) : (
              <RemoteVisualMedia
                socket={socket}
                visualMediaId={key}
                table_id={table_id}
                activeUsername={activeUsername}
                activeInstance={activeInstance}
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
                  permissions: permissions,
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
              <UserVisualMedia
                socket={socket}
                visualMediaId={key}
                table_id={table_id}
                activeUsername={activeUsername}
                activeInstance={activeInstance}
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
                  permissions: permissions,
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
            ) : (
              <RemoteVisualMedia
                socket={socket}
                visualMediaId={key}
                table_id={table_id}
                activeUsername={activeUsername}
                activeInstance={activeInstance}
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
                  permissions: permissions,
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
              table_id={table_id}
              activeUsername={activeUsername}
              activeInstance={activeInstance}
              username={username}
              instance={instance}
              name={name}
              audioStream={audioStream}
              audioRef={audioRef}
              bundleRef={bundleRef}
              handleAudioEffectChange={bundleController.handleAudioEffectChange}
              handleMute={bundleController.handleMute}
              localMute={localMute}
              isUser={bundleOptions.isUser}
              permissions={permissions}
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
