import * as mediasoup from "mediasoup-client";
import { MediaKind, RtpParameters } from "mediasoup-client/lib/RtpParameters";
import { Socket } from "socket.io-client";

const onSwapedConsumer = async (
  event: {
    type: string;
    consumerType: string;
    swappingProducerId: "string";
    swappingUsername: string;
    data: {
      producerId: string;
      id: string;
      kind: MediaKind;
      rtpParameters: RtpParameters;
      type: string;
      producerPaused: boolean;
    };
  },
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  table_id: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  isSubscribed: React.MutableRefObject<boolean>,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      camera?:
        | {
            [cameraId: string]: MediaStreamTrack;
          }
        | undefined;
      screen?:
        | {
            [screenId: string]: MediaStreamTrack;
          }
        | undefined;
      audio?: MediaStreamTrack | undefined;
    };
  }>,
  consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >
) => {
  if (
    event.swappingUsername === username.current ||
    !isSubscribed.current ||
    !device.current
  ) {
    return;
  }

  // Replace old tracks
  const { producerId, id, kind, rtpParameters } = event.data;
  const consumer = await consumerTransport.current?.consume({
    id,
    producerId,
    kind,
    rtpParameters,
  });

  if (
    event.consumerType === "camera" &&
    event.swappingProducerId &&
    remoteTracksMap.current[event.swappingUsername]?.camera?.[
      event.swappingProducerId
    ]
  ) {
    delete remoteTracksMap.current[event.swappingUsername].camera![
      event.swappingProducerId
    ];
    if (consumer) {
      remoteTracksMap.current[event.swappingUsername].camera![
        event.swappingProducerId
      ] = consumer.track;
    }
  } else if (
    event.consumerType === "screen" &&
    event.swappingProducerId &&
    remoteTracksMap.current[event.swappingUsername]?.screen?.[
      event.swappingProducerId
    ]
  ) {
    delete remoteTracksMap.current[event.swappingUsername].screen![
      event.swappingProducerId
    ];
    if (consumer) {
      remoteTracksMap.current[event.swappingUsername].screen![
        event.swappingProducerId
      ] = consumer.track;
    }
  } else if (
    event.consumerType === "audio" &&
    remoteTracksMap.current[event.swappingUsername]?.audio
  ) {
    delete remoteTracksMap.current[event.swappingUsername].audio;
    if (consumer) {
      remoteTracksMap.current[event.swappingUsername].audio = consumer.track;
    }
  }

  const msg = {
    type: "resume",
    table_id: table_id.current,
    username: username.current,
  };
  socket.current.send(msg);

  if (consumer) {
    const message = {
      type: "newConsumerCreated",
      username: username.current,
      table_id: table_id.current,
      producerUsername: event.swappingUsername,
      consumerId: event.swappingProducerId,
      consumerType: event.consumerType,
    };
    socket.current.emit("message", message);
  }
};

export default onSwapedConsumer;
