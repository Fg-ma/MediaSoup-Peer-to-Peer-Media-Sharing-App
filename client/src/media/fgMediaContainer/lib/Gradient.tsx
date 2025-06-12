import React from "react";

export default function Gradient() {
  return (
    <>
      <div
        className="controls-gradient !pointer-events-none absolute bottom-0 z-10 h-20 w-full"
        style={{
          background:
            "linear-gradient(to top, rgba(0, 0, 0, .6) 0%, rgba(0, 0, 0, 0) 100%)",
        }}
      ></div>
      <div
        className="controls-gradient !pointer-events-none absolute top-0 z-10 h-20 w-full"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0, 0, 0, .6) 0%, rgba(0, 0, 0, 0) 100%)",
        }}
      ></div>
    </>
  );
}
