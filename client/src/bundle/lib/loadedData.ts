import formatDuration from "./formatDuration";

const extractThumbnails = async (
  video: HTMLVideoElement,
  videoSrc: string,
  interval: number,
  thumbnailClarity = 5
): Promise<string[]> => {
  const thumbnails: string[] = [];
  const offscreenVideo = document.createElement("video");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const videoAspectRatio = video.videoWidth / video.videoHeight;

  if (!ctx) throw new Error("Failed to get 2D context");

  offscreenVideo.src = videoSrc;
  offscreenVideo.crossOrigin = "anonymous";

  await new Promise<void>((resolve) => {
    offscreenVideo.onloadedmetadata = () => {
      resolve();
    };
  });

  const duration = offscreenVideo.duration;
  const thumbnailHeight = Math.max(video.videoHeight / thumbnailClarity, 90);
  const thumbnailWidth = Math.max(
    video.videoWidth / thumbnailClarity,
    90 * videoAspectRatio
  );

  for (let time = 0; time < duration; time += interval) {
    offscreenVideo.currentTime = time;

    await new Promise<void>((resolve) => {
      offscreenVideo.onseeked = () => {
        canvas.width = thumbnailWidth;
        canvas.height = thumbnailHeight;
        ctx.drawImage(offscreenVideo, 0, 0, thumbnailWidth, thumbnailHeight);
        const thumbnail = canvas.toDataURL("image/png");
        thumbnails.push(thumbnail);
        resolve();
      };
    });
  }

  return thumbnails;
};

const loadedData = (
  videoRef: React.RefObject<HTMLVideoElement>,
  totalTimeRef: React.RefObject<HTMLDivElement>,
  thumbnails: React.MutableRefObject<string[]>,
  isTimeLine: boolean,
  isPreview: boolean,
  isThumbnail: boolean
) => {
  if (!videoRef.current) return;

  if (totalTimeRef.current) {
    totalTimeRef.current.textContent = formatDuration(
      videoRef.current.duration
    );
  }

  const loadThumbnails = async () => {
    if (videoRef.current) {
      const videoSrc = videoRef.current.src;
      const generatedThumbnails = await extractThumbnails(
        videoRef.current,
        videoSrc,
        10,
        5
      );
      thumbnails.current = generatedThumbnails;
    }
  };

  if (isTimeLine && (isPreview || isThumbnail)) {
    loadThumbnails();
  }
};

export default loadedData;
