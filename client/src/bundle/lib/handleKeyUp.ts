const handleKeyUp = (
  event: KeyboardEvent,
  shiftPressed: React.MutableRefObject<boolean>,
  controlPressed: React.MutableRefObject<boolean>
) => {
  switch (event.key.toLowerCase()) {
    case "shift":
      shiftPressed.current = false;
      break;
    case "control":
      controlPressed.current = false;
      break;
  }
};

export default handleKeyUp;
