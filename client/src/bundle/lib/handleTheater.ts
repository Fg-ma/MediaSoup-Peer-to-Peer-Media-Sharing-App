const handleTheater = (
  theater: React.MutableRefObject<boolean>,
  videoContainerRef: React.RefObject<HTMLDivElement>
) => {
  theater.current = !theater.current;
  if (theater.current) {
    videoContainerRef.current?.classList.add("theater");
  } else {
    videoContainerRef.current?.classList.remove("theater");
  }
};

export default handleTheater;
