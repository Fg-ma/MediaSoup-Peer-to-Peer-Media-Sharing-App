import handleClosedCaptions from "./handleClosedCaptions";
import handleFullscreen from "./handleFullscreen";
import handleMiniPlayer from "./handleMiniPlayer";
import handlePausePlay from "./handlePausePlay";
import handleTheater from "./handleTheater";
import skip from "./skip";

const handleKeyDown = (
  event: KeyboardEvent,
  videoContainerRef: React.RefObject<HTMLDivElement>,
  controlPressed: React.MutableRefObject<boolean>,
  shiftPressed: React.MutableRefObject<boolean>,
  isPlayPause: boolean,
  paused: React.MutableRefObject<boolean>,
  videoRef: React.RefObject<HTMLVideoElement>,
  isFullScreen: boolean,
  isTheater: boolean,
  theater: React.MutableRefObject<boolean>,
  isPictureInPicture: boolean,
  isVolume: boolean,
  handleMute: () => void,
  isSkip: boolean,
  skipIncrement: number,
  isClosedCaptions: boolean,
  captions: React.MutableRefObject<TextTrack | undefined>
) => {
  if (!videoContainerRef.current?.classList.contains("in-video")) return;
  const tagName = document.activeElement?.tagName.toLowerCase();
  if (tagName === "input") return;
  if (controlPressed.current || shiftPressed.current) return;

  switch (event.key.toLowerCase()) {
    case "shift":
      shiftPressed.current = true;
      break;
    case "control":
      controlPressed.current = true;
      break;
    case " ":
      if (tagName === "button") return;
      if (isPlayPause) {
        handlePausePlay(paused, videoRef, videoContainerRef);
      }
      break;
    case "mediaplaypause":
      if (isPlayPause) {
        handlePausePlay(paused, videoRef, videoContainerRef);
      }
      break;
    case "k":
      if (isPlayPause) {
        handlePausePlay(paused, videoRef, videoContainerRef);
      }
      break;
    case "f":
      if (isFullScreen) {
        handleFullscreen(videoContainerRef);
      }
      break;
    case "t":
      if (isTheater) {
        handleTheater(theater, videoContainerRef);
      }
      break;
    case "i":
      if (isPictureInPicture) {
        handleMiniPlayer(videoContainerRef, videoRef);
      }
      break;
    case "m":
      if (isVolume) {
        handleMute();
      }
      break;
    case "arrowleft":
      if (isSkip) {
        skip(-skipIncrement, videoRef);
      }
      break;
    case "j":
      if (isSkip) {
        skip(-skipIncrement, videoRef);
      }
      break;
    case "arrowright":
      if (isSkip) {
        skip(skipIncrement, videoRef);
      }
      break;
    case "k":
      if (isSkip) {
        skip(skipIncrement, videoRef);
      }
      break;
    case "c":
      if (isClosedCaptions) {
        handleClosedCaptions(captions, videoContainerRef);
      }
      break;
    default:
      break;
  }
};

export default handleKeyDown;
