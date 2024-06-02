import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const publishAudio = (
  handleDisableEnableBtns: (disabled: boolean) => void,
  isAudio: React.MutableRefObject<boolean>,
  setAudioActive: (value: React.SetStateAction<boolean>) => void,
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
  isAudio.current = !isAudio.current;
  setAudioActive((prev) => !prev);

  if (isAudio.current) {
    if (device.current) {
      const msg = {
        type: "createProducerTransport",
        forceTcp: false,
        rtpCapabilities: device.current.rtpCapabilities,
        producerType: "audio",
        table_id: table_id.current,
        username: username.current,
      };
      socket.current.emit("message", msg);
    }
  } else if (!isAudio.current) {
    const msg = {
      type: "removeProducer",
      table_id: table_id.current,
      username: username.current,
      producerType: "audio",
    };
    socket.current.emit("message", msg);
  }
};

export default publishAudio;
