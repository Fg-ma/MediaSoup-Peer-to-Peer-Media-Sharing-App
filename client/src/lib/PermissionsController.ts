import { Permissions } from "../context/permissionsContext/lib/typeConstant";
import MediasoupSocketController from "../serverControllers/mediasoupServer/MediasoupSocketController";
import { onPermissionsRequestedType } from "../serverControllers/mediasoupServer/lib/typeConstant";

class PermissionsController {
  constructor(
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private tableId: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,
    private permissions: React.MutableRefObject<Permissions>,
  ) {}

  onPermissionsRequested = (event: onPermissionsRequestedType) => {
    const { inquiringUsername, inquiringInstance } = event.header;

    this.mediasoupSocket.current?.sendMessage({
      type: "permissionsResponse",
      header: {
        tableId: this.tableId.current,
        inquiringUsername,
        inquiringInstance,
        inquiredUsername: this.username.current,
        inquiredInstance: this.instance.current,
      },
      data: {
        permissions: this.permissions.current,
      },
    });
  };
}

export default PermissionsController;
