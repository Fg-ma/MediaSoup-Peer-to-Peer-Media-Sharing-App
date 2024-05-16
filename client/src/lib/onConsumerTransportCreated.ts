import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const onConsumerTransportCreated = async (
  event: {
    type: "producerTransportCreated";
    params: {
      id: string;
      iceParameters: mediasoup.types.IceParameters;
      iceCandidates: mediasoup.types.IceCandidate[];
      dtlsParameters: mediasoup.types.DtlsParameters;
    };
    error?: unknown;
  },
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
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
  if (event.error) {
    console.error("On consumer transport create error: ", event.error);
  }

  if (!device.current) {
    console.error("No device found");
    return;
  }

  consumerTransport.current = device.current.createRecvTransport(event.params);

  consumerTransport.current.on(
    "connect",
    ({ dtlsParameters }, callback, errback) => {
      const msg = {
        type: "connectConsumerTransport",
        transportId: consumerTransport.current?.id,
        dtlsParameters,
        roomName: roomName.current,
        username: username.current,
      };

      socket.current.send(msg);
      socket.current.on("message", (event) => {
        if (event.type === "consumerTransportConnected") {
          callback();
        }
      });
    }
  );

  consumerTransport.current.on("connectionstatechange", async (state) => {
    switch (state) {
      case "connecting":
        break;
      case "connected":
        if (!remoteVideosContainerRef.current) {
          break;
        }
        const userVideo = document.getElementById(
          `live_video_track_${username.current}`
        );
        const userScreen = document.getElementById(
          `screen_track_${username.current}`
        );

        remoteVideosContainerRef.current.innerHTML = "";

        if (userVideo) {
          remoteVideosContainerRef.current.appendChild(userVideo);
        }
        if (userScreen) {
          remoteVideosContainerRef.current.appendChild(userScreen);
        }

        Object.entries(remoteTracksMap.current).forEach(
          ([trackUsername, tracks]) => {
            for (const [trackType, trackData] of Object.entries(tracks)) {
              const newVideo = document.createElement("video");
              newVideo.autoplay = true;
              newVideo.playsInline = true;
              newVideo.controls = true;
              if (trackType === "webcam") {
                newVideo.id = `live_video_track_${trackUsername}`;
                newVideo.style.transform = "scaleX(-1)";
              } else if (trackType === "screen") {
                newVideo.id = `screen_track_${trackUsername}`;
              }

              const stream = new MediaStream();
              stream.addTrack(trackData);
              newVideo.srcObject = stream;

              remoteVideosContainerRef.current?.appendChild(newVideo);
            }
          }
        );
        const msg = {
          type: "resume",
          roomName: roomName.current,
          username: username.current,
        };
        socket.current.send(msg);
        break;
      case "failed":
        consumerTransport.current?.close();
        break;
      default:
        break;
    }
  });

  const { rtpCapabilities } = device.current;
  const msg = {
    type: "consume",
    rtpCapabilities: rtpCapabilities,
    roomName: roomName.current,
    username: username.current,
  };
  socket.current.send(msg);
};

export default onConsumerTransportCreated;
