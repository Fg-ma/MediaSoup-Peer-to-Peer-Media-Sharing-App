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
    } = event.header;

    const msg = {
      type: "permissionsRequested",
      header: {
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
    } = event.header;
    const { permissions } = event.data;

    const msg = {
      type: "permissionsResponsed",
      header: {
        inquiredUsername,
        inquiredInstance,
      },
      data: {
        permissions,
      },
    };

    this.io
      .to(`instance_${table_id}_${inquiringUsername}_${inquiringInstance}`)
      .emit("message", msg);
  }
}

export default StatesPermissionsController;
