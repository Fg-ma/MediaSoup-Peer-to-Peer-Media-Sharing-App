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
    inquiredType: "camera" | "screen" | "audio";
    inquiredVideoId: string;
  }) => {
    const msg = {
      type: "requestedCatchUpData",
      inquiringUsername: event.inquiringUsername,
      inquiringInstance: event.inquiringInstance,
      inquiredType: event.inquiredType,
      inquiredVideoId: event.inquiredVideoId,
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
    inquiredType: "camera" | "screen";
    inquiredVideoId: string;
    data:
      | {
          cameraPaused: boolean;
          cameraTimeEllapsed: number;
        }
      | {
          screenPaused: boolean;
          screenTimeEllapsed: number;
        }
      | undefined;
  }) => {
    const msg = {
      type: "responsedCatchUpData",
      inquiredUsername: event.inquiredUsername,
      inquiredInstance: event.inquiredInstance,
      inquiredType: event.inquiredType,
      inquiredVideoId: event.inquiredVideoId,
      data: event.data,
    };
    this.io
      .to(
        `instance_${event.table_id}_${event.inquiringUsername}_${event.inquiringInstance}`
      )
      .emit("message", msg);
  };
}

export default FgMetaData;
