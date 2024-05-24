import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const publishScreen = (
  isScreen: React.MutableRefObject<boolean>,
  webcamBtnRef: React.RefObject<HTMLButtonElement>,
  screenBtnRef: React.RefObject<HTMLButtonElement>,
  audioBtnRef: React.RefObject<HTMLButtonElement>,
  setScreenActive: (value: React.SetStateAction<boolean>) => void,
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  roomName: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  screenCount: React.MutableRefObject<number>,
  screenStreams: React.MutableRefObject<{
    [webcamId: string]: MediaStream;
  }>
) => {
  if (!roomName.current || !username.current) {
    console.error("Missing roomName or username!");
    return;
  }
  webcamBtnRef.current!.disabled = true;
  screenBtnRef.current!.disabled = true;
  audioBtnRef.current!.disabled = true;
  isScreen.current = !isScreen.current;
  setScreenActive((prev) => !prev);

  if (isScreen.current) {
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
    for (let i = screenCount.current; i >= 0; i--) {
      const streamKey = `${username.current}_screen_stream_${i}`;

      if (streamKey in screenStreams.current) {
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
