import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const publishScreen = (
  handleDisableEnableBtns: (disabled: boolean) => void,
  isScreen: React.MutableRefObject<boolean>,
  setScreenActive: (value: React.SetStateAction<boolean>) => void,
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  table_id: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  userScreenCount: React.MutableRefObject<number>,
  userStreams: React.MutableRefObject<{
    camera: {
      [cameraId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>
) => {
  if (!table_id.current || !username.current) {
    console.error("Missing table_id or username!");
    return;
  }
  handleDisableEnableBtns(true);
  isScreen.current = !isScreen.current;
  setScreenActive((prev) => !prev);

  if (isScreen.current) {
    userScreenCount.current = userScreenCount.current + 1;
    if (device.current) {
      const msg = {
        type: "createProducerTransport",
        forceTcp: false,
        rtpCapabilities: device.current.rtpCapabilities,
        producerType: "screen",
        table_id: table_id.current,
        username: username.current,
      };
      socket.current.emit("message", msg);
    }
  } else if (!isScreen.current) {
    for (let i = userScreenCount.current; i >= 0; i--) {
      const streamKey = `${username.current}_screen_stream_${i}`;

      if (streamKey in userStreams.current.screen) {
        const msg = {
          type: "removeProducer",
          table_id: table_id.current,
          username: username.current,
          producerType: "screen",
          producerId: `${username.current}_screen_stream_${i}`,
        };
        socket.current.emit("message", msg);
        break;
      }
    }
  }
};

export default publishScreen;
