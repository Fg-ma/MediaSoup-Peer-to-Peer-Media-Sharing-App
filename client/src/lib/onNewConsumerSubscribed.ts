import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const onNewConsumerSubscribed = async (
  event: {
    type: string;
    producerUsername: string;
    consumerType: string;
    data: {
      producerId: string;
      id: string;
      kind: "audio" | "video" | undefined;
      rtpParameters: mediasoup.types.RtpParameters;
      type: string;
      producerPaused: boolean;
    };
  },
  socket: React.MutableRefObject<Socket>,
  roomName: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      webcam?: MediaStreamTrack | undefined;
      screen?: MediaStreamTrack | undefined;
    };
  }>
) => {
  const { producerId, id, kind, rtpParameters } = event.data;
  const consumer = await consumerTransport.current?.consume({
    id,
    producerId,
    kind,
    rtpParameters,
  });

  if (!consumer) {
    console.error("Failed to create camera consumer!");
    return;
  }

  if (!remoteTracksMap.current[event.producerUsername]) {
    remoteTracksMap.current[event.producerUsername] = {};
  }
  remoteTracksMap.current[event.producerUsername][
    event.consumerType as "webcam" | "screen"
  ] = consumer.track;

  // Create a new video element
  const newVideo = document.createElement("video");
  newVideo.autoplay = true;
  newVideo.playsInline = true;
  newVideo.controls = true;

  // Set the track as the srcObject of the new video element
  const stream = new MediaStream();
  stream.addTrack(consumer.track);
  newVideo.srcObject = stream;

  if (event.consumerType === "webcam") {
    newVideo.id = `live_video_track_${event.producerUsername}`;
    newVideo.style.transform = "scaleX(-1)";
  } else if (event.consumerType === "screen") {
    newVideo.id = `screen_track_${event.producerUsername}`;
  }
  // Append the new video element to the remoteVideosContainerRef
  remoteVideosContainerRef.current?.appendChild(newVideo);

  const msg = {
    type: "resume",
    roomName: roomName.current,
    username: username.current,
  };
  socket.current.send(msg);
};

export default onNewConsumerSubscribed;
