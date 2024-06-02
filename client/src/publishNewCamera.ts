import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const publishNewCamera = (
  handleDisableEnableBtns: (disabled: boolean) => void,
  userCameraCount: React.MutableRefObject<number>,
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  table_id: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>
) => {
  if (!table_id.current || !username.current) {
    console.error("Missing table_id or username!");
    return;
  }
  handleDisableEnableBtns(true);
  userCameraCount.current = userCameraCount.current + 1;

  if (device.current) {
    const msg = {
      type: "createProducerTransport",
      forceTcp: false,
      rtpCapabilities: device.current.rtpCapabilities,
      producerType: "webcam",
      table_id: table_id.current,
      username: username.current,
    };
    socket.current.emit("message", msg);
  }
};

export default publishNewCamera;
