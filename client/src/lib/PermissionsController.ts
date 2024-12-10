import { Socket } from "socket.io-client";
import { Permissions } from "../context/permissionsContext/typeConstant";

class PermissionsController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,
    private permissions: React.MutableRefObject<Permissions>
  ) {}

  onPermissionsRequested = (event: {
    type: "permissionsRequested";
    inquiringUsername: string;
    inquiringInstance: string;
  }) => {
    const msg = {
      type: "permissionsResponse",
      table_id: this.table_id.current,
      inquiringUsername: event.inquiringUsername,
      inquiringInstance: event.inquiringInstance,
      inquiredUsername: this.username.current,
      inquiredInstance: this.instance.current,
      data: {
        permissions: this.permissions.current,
      },
    };

    this.socket.current.emit("message", msg);
  };
}

export default PermissionsController;
