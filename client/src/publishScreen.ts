import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const publishScreen = (
  handleDisableEnableBtns: (disabled: boolean) => void,
  isScreen: React.MutableRefObject<boolean>,
  setScreenActive: (value: React.SetStateAction<boolean>) => void,
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  roomName: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  userScreenCount: React.MutableRefObject<number>,
  userScreenStreams: React.MutableRefObject<{
    [webcamId: string]: MediaStream;
  }>
) => {
  if (!roomName.current || !username.current) {
    console.error("Missing roomName or username!");
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
        roomName: roomName.current,
        username: username.current,
      };
      socket.current.emit("message", msg);
    }
  } else if (!isScreen.current) {
    for (let i = userScreenCount.current; i >= 0; i--) {
      const streamKey = `${username.current}_screen_stream_${i}`;

      if (streamKey in userScreenStreams.current) {
        const msg = {
          type: "removeProducer",
          roomName: roomName.current,
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
