import handleTimelineUpdate from "./handleTimelineUpdate";

const handleScrubbing = (
  event: MouseEvent,
  timelineContainerRef: React.RefObject<HTMLDivElement>,
  videoRef: React.RefObject<HTMLVideoElement>,
  currentTimeRef: React.RefObject<HTMLDivElement>,
  isScrubbing: React.MutableRefObject<boolean>,
  videoContainerRef: React.RefObject<HTMLDivElement>,
  wasPaused: React.MutableRefObject<boolean>,
  previewImgRef: React.RefObject<HTMLImageElement>,
  thumbnails: React.MutableRefObject<string[]>,
  thumbnailImgRef: React.RefObject<HTMLImageElement>
) => {
  if (
    !timelineContainerRef.current ||
    !videoRef.current ||
    !currentTimeRef.current
  )
    return;

  const rect = timelineContainerRef.current.getBoundingClientRect();
  const percent =
    Math.min(Math.max(0, event.x - rect.x), rect.width) / rect.width;

  isScrubbing.current = (event.buttons & 1) === 1;
  videoContainerRef.current?.classList.toggle("scrubbing", isScrubbing.current);
  if (isScrubbing.current) {
    videoContainerRef.current?.classList.add("scrubbing");
    wasPaused.current = videoRef.current.paused;
    videoRef.current.pause();
  } else {
    videoContainerRef.current?.classList.remove("scrubbing");
    videoRef.current.currentTime = percent * videoRef.current.duration;
    if (!wasPaused) videoRef.current.play();
  }

  handleTimelineUpdate(
    event,
    timelineContainerRef,
    videoRef,
    previewImgRef,
    thumbnails,
    isScrubbing,
    thumbnailImgRef,
    currentTimeRef
  );
};

export default handleScrubbing;
