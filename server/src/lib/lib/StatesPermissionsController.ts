import { Server as SocketIOServer } from "socket.io";
import {
  onPermissionsResponseType,
  onRequestPermissionsType,
} from "../mediasoupTypes";

class StatesPermissionsController {
  constructor(private io: SocketIOServer) {}

  onRequestPermissions = (event: onRequestPermissionsType) => {
    const msg = {
      type: "permissionsRequested",
      inquiringUsername: event.inquiringUsername,
      inquiringInstance: event.inquiringInstance,
    };

    this.io
      .to(
        `instance_${event.table_id}_${event.inquiredUsername}_${event.inquiredInstance}`
      )
      .emit("message", msg);
  };

  onPermissionsResponse(event: onPermissionsResponseType) {
    const msg = {
      type: "permissionsResponsed",
      inquiredUsername: event.inquiredUsername,
      inquiredInstance: event.inquiredInstance,
      data: event.data,
    };

    this.io
      .to(
        `instance_${event.table_id}_${event.inquiringUsername}_${event.inquiringInstance}`
      )
      .emit("message", msg);
  }
}

export default StatesPermissionsController;
