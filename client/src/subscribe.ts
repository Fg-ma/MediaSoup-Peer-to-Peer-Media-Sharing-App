import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const subscribe = (
  isSubscribed: React.MutableRefObject<boolean>,
  subBtnRef: React.RefObject<HTMLButtonElement>,
  setSubscribedActive: (value: React.SetStateAction<boolean>) => void,
  socket: React.MutableRefObject<Socket>,
  roomName: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      webcam?: MediaStreamTrack | undefined;
      screen?: MediaStreamTrack | undefined;
    };
  }>,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>
) => {
  if (!roomName.current || !username.current) {
    console.error("Missing roomName or username!");
    return;
  }
  subBtnRef.current!.disabled = true;
  isSubscribed.current = !isSubscribed.current;
  setSubscribedActive((prev) => !prev);

  if (isSubscribed.current) {
    const msg = {
      type: "createConsumerTransport",
      forceTcp: false,
      roomName: roomName.current,
      username: username.current,
    };
    socket.current.send(msg);
  } else if (!isSubscribed.current) {
    consumerTransport.current = undefined;
    for (const producerUsername in remoteTracksMap.current) {
      const oldVideo = document.getElementById(
        `live_video_track_${producerUsername}`
      );
      const oldScreen = document.getElementById(
        `screen_track_${producerUsername}`
      );
      const oldAudio = document.getElementById(
        `audio_track_${producerUsername}`
      );
      if (oldVideo) {
        remoteVideosContainerRef.current?.removeChild(oldVideo);
      }
      if (oldScreen) {
        remoteVideosContainerRef.current?.removeChild(oldScreen);
      }
      if (oldAudio) {
        remoteVideosContainerRef.current?.removeChild(oldAudio);
      }
      delete remoteTracksMap.current[producerUsername];
    }

    const msg = {
      type: "unsubscribe",
      roomName: roomName.current,
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
