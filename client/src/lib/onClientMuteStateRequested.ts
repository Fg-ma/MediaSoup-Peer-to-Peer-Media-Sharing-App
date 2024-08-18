import { Socket } from "socket.io-client";

const onClientMuteStateRequested = (
  event: { type: string; username: string; instance: string },
  socket: React.MutableRefObject<Socket>,
  table_id: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  instance: React.MutableRefObject<string>,
  mutedAudioRef: React.MutableRefObject<boolean>
) => {
  if (mutedAudioRef.current) {
    const msg = {
      type: "clientMuteStateResponse",
      table_id: table_id.current,
      username: event.username,
      instance: event.instance,
      producerUsername: username.current,
      producerInstance: instance.current,
    };

    socket.current.emit("message", msg);
  }
};

export default onClientMuteStateRequested;
