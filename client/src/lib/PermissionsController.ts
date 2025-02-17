import { Permissions } from "../context/permissionsContext/typeConstant";
import MediasoupSocketController, {
  onPermissionsRequestedType,
} from "../serverControllers/mediasoupServer/MediasoupSocketController";

class PermissionsController {
  constructor(
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,
    private permissions: React.MutableRefObject<Permissions>
  ) {}

  onPermissionsRequested = (event: onPermissionsRequestedType) => {
    const { inquiringUsername, inquiringInstance } = event.header;

    this.mediasoupSocket.current?.sendMessage({
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
    });
  };
}

export default PermissionsController;
