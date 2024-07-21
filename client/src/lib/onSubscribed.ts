import * as mediasoup from "mediasoup-client";

const onSubscribed = async (
  event: {
    type: string;
    data: {
      [username: string]: {
        camera?: {
          [cameraId: string]: {
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
      camera?: { [cameraId: string]: MediaStreamTrack };
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
      camera?: { [cameraId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack;
    } = {};

    if (subscriptions[producerUsername].camera) {
      if (!newRemoteTrack.camera) {
        newRemoteTrack.camera = {};
      }
      for (const key in subscriptions[producerUsername].camera) {
        const subscriptionCameraData =
          subscriptions[producerUsername].camera![key];
        const { producerId, id, kind, rtpParameters } = subscriptionCameraData;

        const consumer = await consumerTransport.current.consume({
          id,
          producerId,
          kind,
          rtpParameters,
        });
        newRemoteTrack.camera[key] = consumer.track;
      }
    }

    if (subscriptions[producerUsername].screen) {
      if (!newRemoteTrack.screen) {
        newRemoteTrack.screen = {};
      }
      for (const key in subscriptions[producerUsername].screen) {
        const subscriptionCameraData =
          subscriptions[producerUsername].screen![key];
        const { producerId, id, kind, rtpParameters } = subscriptionCameraData;

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
