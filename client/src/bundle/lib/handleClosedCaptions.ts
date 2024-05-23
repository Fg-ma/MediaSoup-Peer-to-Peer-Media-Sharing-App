const handleClosedCaptions = (
  captions: React.MutableRefObject<TextTrack | undefined>,
  videoContainerRef: React.RefObject<HTMLDivElement>
) => {
  if (captions.current) {
    const isHidden = captions.current.mode === "hidden";
    captions.current.mode = isHidden ? "showing" : "hidden";
    videoContainerRef.current?.classList.toggle("captions", isHidden);
  }
};

export default handleClosedCaptions;
