import * as mediasoup from "mediasoup-client";

const onSubscribed = async (
  event: {
    type: string;
    data: {
      [username: string]: {
        webcam?: {
          producerId: string;
          id: string;
          kind: "audio" | "video" | undefined;
          rtpParameters: any;
          type: string;
          producerPaused: boolean;
        };
        screen?: {
          producerId: string;
          id: string;
          kind: "audio" | "video" | undefined;
          rtpParameters: any;
          type: string;
          producerPaused: boolean;
        };
      };
    };
  },
  consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      webcam?: MediaStreamTrack | undefined;
      screen?: MediaStreamTrack | undefined;
    };
  }>,
  subBtnRef: React.RefObject<HTMLButtonElement>
) => {
  if (!consumerTransport.current) {
    console.error("No consumer transport available!");
    return;
  }
  if (subBtnRef.current) {
    subBtnRef.current.disabled = false;
  }
  const subscriptions = event.data;

  for (const producerUsername in subscriptions) {
    let newRemoteTrack: {
      webcam?: MediaStreamTrack;
      screen?: MediaStreamTrack;
    } = {};

    if (subscriptions[producerUsername].webcam) {
      const subscriptionWebcamData = subscriptions[producerUsername].webcam!;
      const { producerId, id, kind, rtpParameters } = subscriptionWebcamData;

      const consumer = await consumerTransport.current.consume({
        id,
        producerId,
        kind,
        rtpParameters,
      });
      newRemoteTrack.webcam = consumer.track;
    }

    if (subscriptions[producerUsername].screen) {
      const subscriptionScreenData = subscriptions[producerUsername].screen!;
      const { producerId, id, kind, rtpParameters } = subscriptionScreenData;

      const consumer = await consumerTransport.current.consume({
        id,
        producerId,
        kind,
        rtpParameters,
      });
      newRemoteTrack.screen = consumer.track;
    }

    remoteTracksMap.current[producerUsername] = newRemoteTrack;
  }
};

export default onSubscribed;
