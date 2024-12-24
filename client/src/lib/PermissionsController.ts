import { Socket } from "socket.io-client";
import { Permissions } from "../context/permissionsContext/typeConstant";
import { onPermissionsRequestedType } from "src/Main";

class PermissionsController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,
    private permissions: React.MutableRefObject<Permissions>
  ) {}

  onPermissionsRequested = (event: onPermissionsRequestedType) => {
    const { inquiringUsername, inquiringInstance } = event.header;

    const msg = {
      type: "permissionsResponse",
      header: {
        table_id: this.table_id.current,
        inquiringUsername,
        inquiringInstance,
        inquiredUsername: this.username.current,
        inquiredInstance: this.instance.current,
      },
      data: {
        permissions: this.permissions.current,
      },
    };

    this.socket.current.emit("message", msg);
  };
}

export default PermissionsController;
