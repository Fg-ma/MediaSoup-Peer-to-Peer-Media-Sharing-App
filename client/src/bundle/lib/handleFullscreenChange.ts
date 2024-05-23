const handleFullscreenChange = (
  videoContainerRef: React.RefObject<HTMLDivElement>
) => {
  if (!document.fullscreenElement) {
    videoContainerRef.current?.classList.remove("full-screen");
  }
};

export default handleFullscreenChange;
