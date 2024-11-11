import { Server as SocketIOServer } from "socket.io";

class FgMetaData {
  constructor(private io: SocketIOServer) {}

  onRequestCatchUpData = (event: {
    type: "requestCatchUpData";
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
  }) => {
    const msg = {
      type: "requestedCatchUpData",
      inquiringUsername: event.inquiredUsername,
      inquiringInstance: event.inquiredInstance,
      inquiredInstance: event.inquiredInstance,
    };
    this.io
      .to(
        `instance_${event.table_id}_${event.inquiredUsername}_${event.inquiredInstance}`
      )
      .emit("message", msg);
  };

  onResponseCatchUpData = (event: {
    type: "responseCatchUpData";
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredUsername: string;
    inquiredInstance: string;
    data: {
      cameraPaused: boolean | undefined;
      cameraTimeEllapsed: number | undefined;
      screenPaused: boolean | undefined;
      screenTimeEllapsed: number | undefined;
    };
  }) => {
    const msg = {
      type: "responsedCatchUpData",
      inquiredUsername: event.inquiredUsername,
      inquiredInstance: event.inquiredInstance,
      data: event.data,
    };
    this.io
      .to(`user_${event.table_id}_${event.inquiringUsername}`)
      .emit("message", msg);
  };
}

export default FgMetaData;
