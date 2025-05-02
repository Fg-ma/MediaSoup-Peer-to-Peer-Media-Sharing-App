import Broadcaster from "./Broadcaster";
import {
  onPermissionsResponseType,
  onRequestPermissionsType,
} from "../typeConstant";

class StatesPermissionsController {
  constructor(private broadcaster: Broadcaster) {}

  onRequestPermissions = (event: onRequestPermissionsType) => {
    const {
      tableId,
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

    this.broadcaster.broadcastToInstance(
      tableId,
      inquiredUsername,
      inquiredInstance,
      msg
    );
  };

  onPermissionsResponse(event: onPermissionsResponseType) {
    const {
      tableId,
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

    this.broadcaster.broadcastToInstance(
      tableId,
      inquiringUsername,
      inquiringInstance,
      msg
    );
  }
}

export default StatesPermissionsController;
