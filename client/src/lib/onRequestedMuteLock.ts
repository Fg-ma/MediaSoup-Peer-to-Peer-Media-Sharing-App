import { Socket } from "socket.io-client";

const onRequestedMuteLock = (
  event: { type: string; username: string },
  socket: React.MutableRefObject<Socket>,
  username: React.MutableRefObject<string>,
  table_id: React.MutableRefObject<string>,
  mutedAudioRef: React.MutableRefObject<boolean>
) => {
  if (mutedAudioRef.current) {
    const msg = {
      type: "acceptMuteLock",
      table_id: table_id.current,
      username: event.username,
      producerUsername: username.current,
    };

    socket.current.emit("message", msg);
  }
};

export default onRequestedMuteLock;
