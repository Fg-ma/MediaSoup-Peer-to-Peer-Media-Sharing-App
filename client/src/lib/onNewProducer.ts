import * as mediasoup from "mediasoup-client";
import getBrowserMedia from "../getBrowserMedia";

const onNewProducer = async (
  event: {
    type: string;
    producerType: "webcam" | "screen";
  },
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  username: React.MutableRefObject<string>,
  cameraStream: React.MutableRefObject<MediaStream | undefined>,
  screenStream: React.MutableRefObject<MediaStream | undefined>,
  webcamBtnRef: React.RefObject<HTMLButtonElement>,
  screenBtnRef: React.RefObject<HTMLButtonElement>,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >
) => {
  if (event.producerType === "webcam") {
    if (cameraStream.current) {
      console.error("Already existing camera stream for: ", username.current);
      return;
    }
    cameraStream.current = await getBrowserMedia(event.producerType, device);
    if (cameraStream.current) {
      webcamBtnRef.current!.disabled = false;
      const track = cameraStream.current.getVideoTracks()[0];
      const params = {
        track: track,
        appData: {
          producerType: "webcam",
        },
      };
      try {
        await producerTransport.current?.produce(params);
      } catch {
        console.error("Camera new transport failed to produce");
        return;
      }
      const newVideo = document.createElement("video");
      newVideo.autoplay = true;
      newVideo.playsInline = true;
      newVideo.controls = true;
      newVideo.style.transform = "scaleX(-1)";
      newVideo.id = `live_video_track_${username.current}`;

      newVideo.srcObject = cameraStream.current;

      remoteVideosContainerRef.current?.appendChild(newVideo);
    }
  } else if (event.producerType === "screen") {
    if (screenStream.current) {
      console.error("Already existing screen stream for: ", username.current);
      return;
    }
    screenStream.current = await getBrowserMedia(event.producerType, device);
    if (screenStream.current) {
      screenBtnRef.current!.disabled = false;
      const track = screenStream.current.getVideoTracks()[0];
      const params = {
        track: track,
        appData: {
          producerType: "screen",
        },
      };
      await producerTransport.current?.produce(params);

      const newVideo = document.createElement("video");
      newVideo.autoplay = true;
      newVideo.playsInline = true;
      newVideo.controls = true;
      newVideo.id = `screen_track_${username.current}`;

      newVideo.srcObject = screenStream.current;

      remoteVideosContainerRef.current?.appendChild(newVideo);
    }
  }
};

export default onNewProducer;
