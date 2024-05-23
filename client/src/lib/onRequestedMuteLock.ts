import { Socket } from "socket.io-client";

const onRequestedMuteLock = (
  event: { type: string; username: string },
  socket: React.MutableRefObject<Socket>,
  username: React.MutableRefObject<string>,
  roomName: React.MutableRefObject<string>,
  mutedAudioRef: React.MutableRefObject<boolean>
) => {
  if (mutedAudioRef.current) {
    const msg = {
      type: "acceptMuteLock",
      roomName: roomName.current,
      username: event.username,
      producerUsername: username.current,
    };

    socket.current.emit("message", msg);
  }
};

export default onRequestedMuteLock;
