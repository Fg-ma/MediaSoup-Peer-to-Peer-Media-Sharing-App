const handlePictureInPicture = (
  action: string,
  videoContainerRef: React.RefObject<HTMLDivElement>
) => {
  if (action === "enter") {
    videoContainerRef.current?.classList.add("mini-player");
  } else if (action === "leave") {
    videoContainerRef.current?.classList.remove("mini-player");
  }
};

export default handlePictureInPicture;
