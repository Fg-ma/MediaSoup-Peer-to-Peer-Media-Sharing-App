import React, { Suspense, useEffect, useRef, useState } from "react";
import { useEffectsContext } from "../context/effectsContext/EffectsContext";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useSignalContext } from "../context/signalContext/SignalContext";
import { BundleOptions, defaultBundleOptions } from "./lib/typeConstant";
import { Permissions } from "../context/permissionsContext/lib/typeConstant";
import { useSocketContext } from "../context/socketContext/SocketContext";
import BundleController from "./lib/BundleController";

const UserVisualMedia = React.lazy(
  () => import("../media/fgVisualMedia/UserVisualMedia"),
);
const RemoteVisualMedia = React.lazy(
  () => import("../media/fgVisualMedia/RemoteVisualMedia.tsx"),
);
const FgAudioElementContainer = React.lazy(
  () => import("../media/audio/FgAudioElementContainer"),
);

export default function Bundle({
  tableId,
  username,
  instance,
  name,
  initCameraStreams,
  initScreenStreams,
  initScreenAudioStreams,
  initAudioStream,
  handleDisableEnableBtns,
  isAudio,
  setAudioActive,
  options,
  handleMuteCallback,
  onRendered,
  onNewConsumerWasCreatedCallback,
}: {
  tableId: string;
  username: string;
  instance: string;
  name?: string;
  initCameraStreams?: { [cameraId: string]: MediaStream };
  initScreenStreams?: { [screenId: string]: MediaStream };
  initScreenAudioStreams?: { [screenAudioId: string]: MediaStream };
  initAudioStream?: MediaStream;
  handleDisableEnableBtns: (disabled: boolean) => void;
  isAudio: React.MutableRefObject<boolean>;
  setAudioActive: React.Dispatch<React.SetStateAction<boolean>>;
  options?: BundleOptions;
  handleMuteCallback?: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
  ) => void;
  onRendered?: () => void;
  onNewConsumerWasCreatedCallback?: () => void;
}) {
  const bundleOptions = {
    ...defaultBundleOptions,
    ...options,
  };

  const { userMedia, remoteMedia } = useMediaContext();
  const { remoteEffectsStyles, remoteEffects } = useEffectsContext();
  const { addGeneralSignalListener, removeGeneralSignalListener } =
    useSignalContext();
  const { mediasoupSocket } = useSocketContext();

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
    initAudioStream,
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const bundleRef = useRef<HTMLDivElement>(null);

  const clientMute = useRef(false); // User audio mute
  const screenAudioClientMute = useRef<{ [screenAudioId: string]: boolean }>(
    {},
  ); // User screen audio mute
  const localMute = useRef(false); // Not user audio mute
  const screenAudioLocalMute = useRef<{ [screenAudioId: string]: boolean }>({}); // Not user screen audio mute

  const [permissions, setPermissions] = useState<Permissions>(
    bundleOptions.permissions,
  );

  const bundleController = useRef(
    new BundleController(
      mediasoupSocket,
      bundleOptions.isUser,
      tableId,
      username,
      instance,
      bundleOptions,
      setCameraStreams,
      setScreenStreams,
      setScreenAudioStreams,
      setAudioStream,
      remoteMedia,
      remoteEffects,
      remoteEffectsStyles,
      userMedia,
      bundleRef,
      audioRef,
      clientMute,
      screenAudioClientMute,
      localMute,
      screenAudioLocalMute,
      permissions,
      setPermissions,
      onNewConsumerWasCreatedCallback,
      handleMuteCallback,
    ),
  );

  useEffect(() => {
    if (onRendered) {
      onRendered();
    }

    mediasoupSocket.current?.addMessageListener(
      bundleController.current.handleMessage,
    );
    addGeneralSignalListener(bundleController.current.handleSignalMessage);

    return () => {
      mediasoupSocket.current?.removeMessageListener(
        bundleController.current.handleMessage,
      );
      removeGeneralSignalListener(bundleController.current.handleSignalMessage);
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
    if (bundleOptions.isUser) {
      return;
    }

    for (const screenId in screenStreams) {
      const screenAudioId = `${screenId}_audio`;
      if (userMedia.current.screenAudio[screenAudioId]) {
        if (screenAudioClientMute.current[screenAudioId] === undefined) {
          screenAudioClientMute.current[screenAudioId] = false;
        }
        if (screenAudioLocalMute.current[screenAudioId] === undefined) {
          screenAudioLocalMute.current[screenAudioId] = false;
        }
      }
    }
    for (const screenAudioId in screenAudioStreams) {
      if (userMedia.current.screenAudio[screenAudioId]) {
        if (screenAudioClientMute.current[screenAudioId] === undefined) {
          screenAudioClientMute.current[screenAudioId] = false;
        }
        if (screenAudioLocalMute.current[screenAudioId] === undefined) {
          screenAudioLocalMute.current[screenAudioId] = false;
        }
      }
    }
  }, [screenStreams, screenAudioStreams]);

  return (
    <div
      ref={bundleRef}
      id={`${username}_bundle_container`}
      className="pointer-events-none absolute left-0 top-0 h-full w-full"
    >
      {cameraStreams &&
        Object.keys(cameraStreams).length !== 0 &&
        Object.entries(cameraStreams).map(([key, cameraStream]) => (
          <Suspense key={key} fallback={<div>Loading...</div>}>
            {bundleOptions.isUser ? (
              <UserVisualMedia
                visualMediaId={key}
                tableId={tableId}
                username={username}
                instance={instance}
                name={name}
                type="camera"
                bundleRef={bundleRef}
                audioStream={audioStream}
                audioRef={audioRef}
                handleAudioEffectChange={
                  bundleController.current.handleAudioEffectChange
                }
                clientMute={clientMute}
                screenAudioClientMute={screenAudioClientMute}
                localMute={localMute}
                screenAudioLocalMute={screenAudioLocalMute}
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
                handleMute={bundleController.current.handleMute}
                handleMuteCallback={handleMuteCallback}
                handleVolumeSliderCallback={
                  bundleController.current.handleVolumeSliderCallback
                }
                tracksColorSetterCallback={
                  bundleController.current.tracksColorSetterCallback
                }
              />
            ) : (
              <RemoteVisualMedia
                visualMediaId={key}
                tableId={tableId}
                username={username}
                instance={instance}
                name={name}
                type="camera"
                bundleRef={bundleRef}
                videoStream={cameraStream}
                audioStream={audioStream}
                audioRef={audioRef}
                handleAudioEffectChange={
                  bundleController.current.handleAudioEffectChange
                }
                clientMute={clientMute}
                screenAudioClientMute={screenAudioClientMute}
                localMute={localMute}
                screenAudioLocalMute={screenAudioLocalMute}
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
                handleMute={bundleController.current.handleMute}
                handleMuteCallback={handleMuteCallback}
                handleVolumeSliderCallback={
                  bundleController.current.handleVolumeSliderCallback
                }
                tracksColorSetterCallback={
                  bundleController.current.tracksColorSetterCallback
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
                visualMediaId={key}
                tableId={tableId}
                username={username}
                instance={instance}
                name={name}
                type="screen"
                bundleRef={bundleRef}
                audioStream={audioStream}
                screenAudioStream={
                  userMedia.current.screenAudio &&
                  userMedia.current.screenAudio?.[`${key}_audio`]
                    ? userMedia.current.screenAudio?.[
                        `${key}_audio`
                      ].getMasterStream()
                    : undefined
                }
                audioRef={audioRef}
                handleAudioEffectChange={
                  bundleController.current.handleAudioEffectChange
                }
                clientMute={clientMute}
                screenAudioClientMute={screenAudioClientMute}
                localMute={localMute}
                screenAudioLocalMute={screenAudioLocalMute}
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
                handleMute={bundleController.current.handleMute}
                handleMuteCallback={handleMuteCallback}
                handleVolumeSliderCallback={
                  bundleController.current.handleVolumeSliderCallback
                }
                tracksColorSetterCallback={
                  bundleController.current.tracksColorSetterCallback
                }
              />
            ) : (
              <RemoteVisualMedia
                visualMediaId={key}
                tableId={tableId}
                username={username}
                instance={instance}
                name={name}
                type="screen"
                bundleRef={bundleRef}
                videoStream={screenStream}
                audioStream={audioStream}
                screenAudioStream={screenAudioStreams?.[`${key}_audio`]}
                audioRef={audioRef}
                handleAudioEffectChange={
                  bundleController.current.handleAudioEffectChange
                }
                clientMute={clientMute}
                screenAudioClientMute={screenAudioClientMute}
                localMute={localMute}
                screenAudioLocalMute={screenAudioLocalMute}
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
                handleMute={bundleController.current.handleMute}
                handleMuteCallback={handleMuteCallback}
                handleVolumeSliderCallback={
                  bundleController.current.handleVolumeSliderCallback
                }
                tracksColorSetterCallback={
                  bundleController.current.tracksColorSetterCallback
                }
              />
            )}
          </Suspense>
        ))}
      {audioStream &&
        Object.keys(cameraStreams ?? {}).length === 0 &&
        (Object.keys(screenStreams ?? {}).length === 0 ||
          (bundleOptions.isUser &&
            Object.keys(userMedia.current.screenAudio ?? {}).length !== 0) ||
          (!bundleOptions.isUser && screenAudioStreams)) && (
          <Suspense fallback={<div>Loading...</div>}>
            <FgAudioElementContainer
              tableId={tableId}
              username={username}
              instance={instance}
              name={name}
              audioStream={audioStream}
              audioRef={audioRef}
              bundleRef={bundleRef}
              handleAudioEffectChange={
                bundleController.current.handleAudioEffectChange
              }
              handleMute={bundleController.current.handleMute}
              localMute={localMute}
              isUser={bundleOptions.isUser}
              permissions={permissions}
              clientMute={clientMute}
              handleDisableEnableBtns={handleDisableEnableBtns}
              isAudio={isAudio}
              setAudioActive={setAudioActive}
            />
          </Suspense>
        )}
      <audio
        ref={audioRef}
        id={`${username}_audio_stream`}
        className="w-0"
        autoPlay={true}
      ></audio>
    </div>
  );
}
