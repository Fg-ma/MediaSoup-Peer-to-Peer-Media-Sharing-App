const handleFullscreen = (
  videoContainerRef: React.RefObject<HTMLDivElement>
) => {
  if (videoContainerRef.current?.classList.contains("full-screen")) {
    document
      .exitFullscreen()
      .then(() => {
        videoContainerRef.current?.classList.remove("full-screen");
      })
      .catch((error) => {
        console.error("Failed to exit full screen:", error);
      });
  } else {
    videoContainerRef.current
      ?.requestFullscreen()
      .then(() => {
        videoContainerRef.current?.classList.add("full-screen");
      })
      .catch((error) => {
        console.error("Failed to request full screen:", error);
      });
  }
};

export default handleFullscreen;
