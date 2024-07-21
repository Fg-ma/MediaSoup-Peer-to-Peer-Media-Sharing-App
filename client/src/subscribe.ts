import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const subscribe = (
  isSubscribed: React.MutableRefObject<boolean>,
  subBtnRef: React.RefObject<HTMLButtonElement>,
  setSubscribedActive: (value: React.SetStateAction<boolean>) => void,
  socket: React.MutableRefObject<Socket>,
  table_id: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      camera?: { [cameraId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack;
    };
  }>,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>
) => {
  if (!table_id.current || !username.current) {
    console.error("Missing table_id or username!");
    return;
  }
  subBtnRef.current!.disabled = true;
  isSubscribed.current = !isSubscribed.current;
  setSubscribedActive((prev) => !prev);

  if (isSubscribed.current) {
    const msg = {
      type: "createConsumerTransport",
      forceTcp: false,
      table_id: table_id.current,
      username: username.current,
    };
    socket.current.send(msg);
  } else if (!isSubscribed.current) {
    consumerTransport.current = undefined;

    for (const username in remoteTracksMap.current) {
      const oldBundle = document.getElementById(`${username}_bundle`);
      if (oldBundle) {
        remoteVideosContainerRef.current?.removeChild(oldBundle);
      }
    }
    remoteTracksMap.current = {};

    const msg = {
      type: "unsubscribe",
      table_id: table_id.current,
      username: username.current,
    };
    socket.current.emit("message", msg);
    socket.current.on("message", (event) => {
      if (event.type === "unsubscribed") {
        subBtnRef.current!.disabled = false;
      }
    });
  }
};

export default subscribe;
