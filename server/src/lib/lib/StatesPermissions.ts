import { Server as SocketIOServer } from "socket.io";

class StatesPermissions {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  onRequestStatesPermissions(event: {
    type: "requestStatesPermissions";
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
  }) {
    const msg = {
      type: "statesPermissionsRequested",
      inquiringUsername: event.inquiringUsername,
      inquiringInstance: event.inquiringInstance,
    };

    this.io
      .to(
        `instance_${event.table_id}_${event.inquiredUsername}_${event.inquiredInstance}`
      )
      .emit("message", msg);
  }

  onStatesPermissionsResponse(event: {
    type: "statesPermissionsResponse";
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
    clientMute: boolean;
    cameraPermission: boolean;
    screenPermission: boolean;
    audioPermission: boolean;
    streamEffects: any;
    currentEffectsStyles: any;
  }) {
    const msg = {
      type: "statesPermissionsResponsed",
      inquiredUsername: event.inquiredUsername,
      inquiredInstance: event.inquiredInstance,
      clientMute: event.clientMute,
      cameraPermission: event.cameraPermission,
      screenPermission: event.screenPermission,
      audioPermission: event.audioPermission,
      streamEffects: event.streamEffects,
      currentEffectsStyles: event.currentEffectsStyles,
    };

    this.io
      .to(
        `instance_${event.table_id}_${event.inquiringUsername}_${event.inquiringInstance}`
      )
      .emit("message", msg);
  }
}

export default StatesPermissions;
