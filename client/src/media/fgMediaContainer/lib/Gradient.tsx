import React from "react";

export default function Gradient() {
  return (
    <>
      <div
        className='controls-gradient absolute bottom-0 w-full h-20 z-10 pointer-events-none'
        style={{
          background:
            "linear-gradient(to top, rgba(0, 0, 0, .6) 0%, rgba(0, 0, 0, 0) 100%)",
        }}
      ></div>
      <div
        className='controls-gradient absolute top-0 w-full h-20 z-10 pointer-events-none'
        style={{
          background:
            "linear-gradient(to bottom, rgba(0, 0, 0, .6) 0%, rgba(0, 0, 0, 0) 100%)",
        }}
      ></div>
    </>
  );
}
