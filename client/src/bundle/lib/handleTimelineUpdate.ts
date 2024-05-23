import formatDuration from "./formatDuration";

const handleTimelineUpdate = (
  event: MouseEvent,
  timelineContainerRef: React.RefObject<HTMLDivElement>,
  videoRef: React.RefObject<HTMLVideoElement>,
  previewImgRef: React.RefObject<HTMLImageElement>,
  thumbnails: React.MutableRefObject<string[]>,
  isScrubbing: React.MutableRefObject<boolean>,
  thumbnailImgRef: React.RefObject<HTMLImageElement>,
  currentTimeRef: React.RefObject<HTMLDivElement>
) => {
  if (
    !timelineContainerRef.current ||
    !videoRef.current ||
    !previewImgRef.current
  )
    return;

  const rect = timelineContainerRef.current.getBoundingClientRect();
  const percent =
    Math.min(Math.max(0, event.x - rect.x), rect.width) / rect.width;
  const previewImgIndex = Math.max(
    1,
    Math.floor((percent * videoRef.current.duration) / 10)
  );
  const previewImgSrc = thumbnails.current[previewImgIndex];
  previewImgRef.current.src = previewImgSrc;
  timelineContainerRef.current.style.setProperty(
    "--preview-position",
    `${percent}`
  );

  if (
    isScrubbing.current &&
    thumbnailImgRef.current &&
    currentTimeRef.current
  ) {
    event.preventDefault();
    thumbnailImgRef.current.src = previewImgSrc;
    timelineContainerRef.current.style.setProperty(
      "--progress-position",
      `${percent}`
    );

    currentTimeRef.current.textContent = formatDuration(
      percent * videoRef.current.duration
    );
  }
};

export default handleTimelineUpdate;
