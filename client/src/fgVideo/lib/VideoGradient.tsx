import React from "react";

export default function VideoGradient() {
  return (
    <>
      <div
        className='controls-gradient absolute bottom-0 w-full h-20 z-10'
        style={{
          background: `linear-gradient(to top, rgba(0, 0, 0, .5) -10%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 100%)`,
        }}
      ></div>
      <div
        className='controls-gradient absolute top-0 w-full h-20 z-10'
        style={{
          background: `linear-gradient(to bottom, rgba(0, 0, 0, .5) -10%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 100%)`,
        }}
      ></div>
    </>
  );
}
