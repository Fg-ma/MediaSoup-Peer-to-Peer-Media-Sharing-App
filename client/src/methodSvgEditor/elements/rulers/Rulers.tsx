import React, { useRef } from "react";

export default function Rulers() {
  const rulersRef = useRef<HTMLDivElement>(null);
  const rulerCornerRef = useRef<HTMLDivElement>(null);
  const rulerXRef = useRef<HTMLDivElement>(null);
  const rulerYRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={rulersRef} id='rulers'>
      <div ref={rulerCornerRef} id='ruler_corner'></div>
      <div ref={rulerXRef} id='ruler_x'></div>
      <div ref={rulerYRef} id='ruler_y'></div>
    </div>
  );
}
