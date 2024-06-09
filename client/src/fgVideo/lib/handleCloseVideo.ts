import { Socket } from "socket.io-client";

const handleCloseVideo = (
  socket: React.MutableRefObject<Socket> | undefined,
  table_id: string,
  username: string,
  type: string,
  producerId: string
) => {
  if (socket) {
    const msg = {
      type: "removeProducer",
      table_id: table_id,
      username: username,
      producerType: type,
      producerId: producerId,
    };
    socket.current.emit("message", msg);
  }
};

export default handleCloseVideo;
