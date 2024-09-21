import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { VoskResult } from "../../fgVideoControls/lib/CaptionButton";

export default function FgVideoCaptions({
  videoContainerRef,
  browserStandardSpeechRecognitionAvailable,
  voskCaptions,
  browserCaptions,
}: {
  videoContainerRef: React.RefObject<HTMLDivElement>;
  browserStandardSpeechRecognitionAvailable: React.MutableRefObject<boolean>;
  voskCaptions?: VoskResult;
  browserCaptions: string;
}) {
  const [timedOut, setTimedOut] = useState(false);
  const timeOut = useRef<NodeJS.Timeout | undefined>(undefined);

  if (!videoContainerRef.current) {
    return;
  }

  useEffect(() => {
    timeOut.current = setTimeout(() => {
      setTimedOut(true);
    }, 5500);

    return () => {
      setTimedOut(false);
      clearTimeout(timeOut.current);
      timeOut.current = undefined;
    };
  }, [voskCaptions, browserCaptions]);

  return ReactDOM.createPortal(
    <div className='captions'>
      {!timedOut &&
        browserStandardSpeechRecognitionAvailable.current &&
        browserCaptions && (
          <div className='caption-text'>{browserCaptions}</div>
        )}
      {!timedOut &&
        !browserStandardSpeechRecognitionAvailable.current &&
        voskCaptions &&
        voskCaptions.result.text && (
          <div className='caption-text'>{voskCaptions.result.text}</div>
        )}
    </div>,
    videoContainerRef.current
  );
}
