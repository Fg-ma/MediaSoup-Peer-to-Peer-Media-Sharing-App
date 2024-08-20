import { Socket } from "socket.io-client";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "src/context/StreamsContext";

const onStatesPermissionsRequested = (
  event: {
    type: "statesPermissionsRequested";
    inquiringUsername: string;
    inquiringInstance: string;
  },
  socket: React.MutableRefObject<Socket>,
  table_id: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  instance: React.MutableRefObject<string>,
  mutedAudioRef: React.MutableRefObject<boolean>,
  acceptCameraEffects: boolean,
  acceptScreenEffects: boolean,
  acceptAudioEffects: boolean,
  userStreamEffects: React.MutableRefObject<{
    camera: {
      [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
    };
    screen: {
      [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
    };
    audio: { [effectType in AudioEffectTypes]: boolean };
  }>,
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>
) => {
  const msg = {
    type: "statesPermissionsResponse",
    table_id: table_id.current,
    inquiringUsername: event.inquiringUsername,
    inquiringInstance: event.inquiringInstance,
    inquiredUsername: username.current,
    inquiredInstance: instance.current,
    clientMute: mutedAudioRef.current,
    cameraPermission: acceptCameraEffects,
    screenPermission: acceptScreenEffects,
    audioPermission: acceptAudioEffects,
    streamEffects: userStreamEffects.current,
    currentEffectsStyles: currentEffectsStyles.current,
  };

  socket.current.emit("message", msg);
};

export default onStatesPermissionsRequested;
