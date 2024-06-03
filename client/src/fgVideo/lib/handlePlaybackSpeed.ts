const handlePlaybackSpeed = (
  videoRef: React.RefObject<HTMLVideoElement>,
  playbackSpeedButtonRef: React.RefObject<HTMLButtonElement>
) => {
  if (!videoRef.current || !playbackSpeedButtonRef.current) return;

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
  const currentPlaybackRateIndex = playbackRates.findIndex(
    (rate) => rate === videoRef.current?.playbackRate
  );

  const nextPlaybackRateIndex =
    (currentPlaybackRateIndex + 1) % playbackRates.length;

  videoRef.current.playbackRate = playbackRates[nextPlaybackRateIndex];
  playbackSpeedButtonRef.current.textContent = `${playbackRates[nextPlaybackRateIndex]}x`;
};

export default handlePlaybackSpeed;
