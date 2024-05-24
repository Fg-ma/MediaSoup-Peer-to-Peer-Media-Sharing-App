import * as mediasoup from "mediasoup-client";

const onSubscribed = async (
  event: {
    type: string;
    data: {
      [username: string]: {
        webcam?: {
          [webcamId: string]: {
            producerId: string;
            id: string;
            kind: "audio" | "video" | undefined;
            rtpParameters: any;
            type: string;
            producerPaused: boolean;
          };
        };
        screen?: {
          [screenId: string]: {
            producerId: string;
            id: string;
            kind: "audio" | "video" | undefined;
            rtpParameters: any;
            type: string;
            producerPaused: boolean;
          };
        };
        audio?: {
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
      webcam?: { [webcamId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack | undefined;
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
      webcam?: { [webcamId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack;
    } = {};

    if (subscriptions[producerUsername].webcam) {
      if (!newRemoteTrack.webcam) {
        newRemoteTrack.webcam = {};
      }
      for (const key in subscriptions[producerUsername].webcam) {
        const subscriptionWebcamData =
          subscriptions[producerUsername].webcam![key];
        const { producerId, id, kind, rtpParameters } = subscriptionWebcamData;

        const consumer = await consumerTransport.current.consume({
          id,
          producerId,
          kind,
          rtpParameters,
        });
        newRemoteTrack.webcam[key] = consumer.track;
      }
    }

    if (subscriptions[producerUsername].screen) {
      if (!newRemoteTrack.screen) {
        newRemoteTrack.screen = {};
      }
      for (const key in subscriptions[producerUsername].screen) {
        const subscriptionWebcamData =
          subscriptions[producerUsername].screen![key];
        const { producerId, id, kind, rtpParameters } = subscriptionWebcamData;

        const consumer = await consumerTransport.current.consume({
          id,
          producerId,
          kind,
          rtpParameters,
        });
        newRemoteTrack.screen[key] = consumer.track;
      }
    }

    if (subscriptions[producerUsername].audio) {
      const subscriptionAudioData = subscriptions[producerUsername].audio!;
      const { producerId, id, kind, rtpParameters } = subscriptionAudioData;

      const consumer = await consumerTransport.current.consume({
        id,
        producerId,
        kind,
        rtpParameters,
      });
      newRemoteTrack.audio = consumer.track;
    }

    remoteTracksMap.current[producerUsername] = newRemoteTrack;
  }
};

export default onSubscribed;
