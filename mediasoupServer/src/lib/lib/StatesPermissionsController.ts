import { Server as SocketIOServer } from "socket.io";
import {
  onPermissionsResponseType,
  onRequestPermissionsType,
} from "../mediasoupTypes";

class StatesPermissionsController {
  constructor(private io: SocketIOServer) {}

  onRequestPermissions = (event: onRequestPermissionsType) => {
    const {
      table_id,
      inquiringUsername,
      inquiringInstance,
      inquiredUsername,
      inquiredInstance,
    } = event.data;

    const msg = {
      type: "permissionsRequested",
      data: {
        inquiringUsername,
        inquiringInstance,
      },
    };

    this.io
      .to(`instance_${table_id}_${inquiredUsername}_${inquiredInstance}`)
      .emit("message", msg);
  };

  onPermissionsResponse(event: onPermissionsResponseType) {
    const {
      table_id,
      inquiringUsername,
      inquiringInstance,
      inquiredUsername,
      inquiredInstance,
      permissions,
    } = event.data;

    const msg = {
      type: "permissionsResponsed",
      data: {
        inquiredUsername,
        inquiredInstance,
        permissions,
      },
    };

    this.io
      .to(`instance_${table_id}_${inquiringUsername}_${inquiringInstance}`)
      .emit("message", msg);
  }
}

export default StatesPermissionsController;
