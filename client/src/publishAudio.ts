import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const publishAudio = (
  isAudio: React.MutableRefObject<boolean>,
  newCameraBtnRef: React.RefObject<HTMLButtonElement>,
  webcamBtnRef: React.RefObject<HTMLButtonElement>,
  screenBtnRef: React.RefObject<HTMLButtonElement>,
  audioBtnRef: React.RefObject<HTMLButtonElement>,
  setAudioActive: (value: React.SetStateAction<boolean>) => void,
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  roomName: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>
) => {
  if (!roomName.current || !username.current) {
    console.error("Missing roomName or username!");
    return;
  }
  if (webcamBtnRef.current) webcamBtnRef.current.disabled = true;
  if (screenBtnRef.current) screenBtnRef.current.disabled = true;
  if (audioBtnRef.current) audioBtnRef.current.disabled = true;
  if (newCameraBtnRef.current) newCameraBtnRef.current.disabled = true;
  isAudio.current = !isAudio.current;
  setAudioActive((prev) => !prev);

  if (isAudio.current) {
    if (device.current) {
      const msg = {
        type: "createProducerTransport",
        forceTcp: false,
        rtpCapabilities: device.current.rtpCapabilities,
        producerType: "audio",
        roomName: roomName.current,
        username: username.current,
      };
      socket.current.emit("message", msg);
    }
  } else if (!isAudio.current) {
    const msg = {
      type: "removeProducer",
      roomName: roomName.current,
      username: username.current,
      producerType: "audio",
    };
    socket.current.emit("message", msg);
  }
};

export default publishAudio;
