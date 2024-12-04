import { Server as SocketIOServer } from "socket.io";
import { Permissions } from "./typeConstant";

class StatesPermissions {
  constructor(private io: SocketIOServer) {}

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
    permissions: Permissions;
    streamEffects: string;
    currentEffectsStyles: string;
  }) {
    const msg = {
      type: "statesPermissionsResponsed",
      inquiredUsername: event.inquiredUsername,
      inquiredInstance: event.inquiredInstance,
      clientMute: event.clientMute,
      permissions: event.permissions,
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
