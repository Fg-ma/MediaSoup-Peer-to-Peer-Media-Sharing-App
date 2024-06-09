import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const publishCamera = (
  handleDisableEnableBtns: (disabled: boolean) => void,
  isWebcam: React.MutableRefObject<boolean>,
  setWebcamActive: (value: React.SetStateAction<boolean>) => void,
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  table_id: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  userCameraCount: React.MutableRefObject<number>,
  userStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
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
  isWebcam.current = !isWebcam.current;
  setWebcamActive((prev) => !prev);

  if (isWebcam.current) {
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
  } else if (!isWebcam.current) {
    for (let i = userCameraCount.current; i >= 0; i--) {
      const streamKey = `${username.current}_camera_stream_${i}`;

      if (streamKey in userStreams.current.webcam) {
        const msg = {
          type: "removeProducer",
          table_id: table_id.current,
          username: username.current,
          producerType: "webcam",
          producerId: `${username.current}_camera_stream_${i}`,
        };
        socket.current.emit("message", msg);
        break;
      }
    }
  }
};

export default publishCamera;
