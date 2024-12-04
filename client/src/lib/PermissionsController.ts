import { Socket } from "socket.io-client";
import { EffectStylesType } from "../context/currentEffectsStylesContext/typeConstant";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/streamsContext/typeConstant";
import { Permissions } from "../context/permissionsContext/PermissionsContext";

class PermissionsController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,
    private mutedAudioRef: React.MutableRefObject<boolean>,
    private permissions: React.MutableRefObject<Permissions>,
    private userStreamEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: {
        [effectType in AudioEffectTypes]: boolean;
      };
    }>,
    private currentEffectsStyles: React.MutableRefObject<EffectStylesType>
  ) {}

  onStatesPermissionsRequested = (event: {
    type: "statesPermissionsRequested";
    inquiringUsername: string;
    inquiringInstance: string;
  }) => {
    const msg = {
      type: "statesPermissionsResponse",
      table_id: this.table_id.current,
      inquiringUsername: event.inquiringUsername,
      inquiringInstance: event.inquiringInstance,
      inquiredUsername: this.username.current,
      inquiredInstance: this.instance.current,
      clientMute: this.mutedAudioRef.current,
      permissions: this.permissions.current,
      streamEffects: this.userStreamEffects.current,
      currentEffectsStyles: this.currentEffectsStyles.current,
    };

    this.socket.current.emit("message", msg);
  };
}

export default PermissionsController;
