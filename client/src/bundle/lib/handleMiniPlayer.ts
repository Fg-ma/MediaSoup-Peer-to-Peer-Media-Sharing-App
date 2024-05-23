const handleMiniPlayer = (
  videoContainerRef: React.RefObject<HTMLDivElement>,
  videoRef: React.RefObject<HTMLVideoElement>
) => {
  if (videoContainerRef.current?.classList.contains("mini-player")) {
    document.exitPictureInPicture().catch((error) => {
      console.error("Failed to exit picture in picture:", error);
    });
  } else {
    videoRef.current?.requestPictureInPicture().catch((error) => {
      console.error("Failed to request picture in picture:", error);
    });
  }
};

export default handleMiniPlayer;
