const handleEffects = (
  isEffects: boolean,
  setIsEffects: React.Dispatch<React.SetStateAction<boolean>>,
  videoContainerRef: React.RefObject<HTMLDivElement>
) => {
  if (!isEffects) {
    videoContainerRef.current?.classList.add("in-effects");
  } else {
    videoContainerRef.current?.classList.remove("in-effects");
  }
  setIsEffects((prev) => !prev);
};

export default handleEffects;
