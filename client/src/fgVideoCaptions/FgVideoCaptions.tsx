import React, { useState } from "react";

export default function FgVideoCaptions({
  captionsRef,
}: {
  captionsRef: React.RefObject<HTMLDivElement>;
}) {
  const [currentCaptions, setCurrentCaptions] = useState("hellosasdasd");

  return (
    <div ref={captionsRef} className='captions'>
      {currentCaptions}
    </div>
  );
}
