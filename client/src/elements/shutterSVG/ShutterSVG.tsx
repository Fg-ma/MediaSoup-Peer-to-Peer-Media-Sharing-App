import React, { useEffect, useRef, useState } from "react";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const cameraShutter =
  nginxAssetServerBaseUrl + "appSoundEffects/cameraShutter.mp3";

export default function ShutterSVG({
  soundEffect = false,
}: {
  soundEffect?: boolean;
}) {
  const [finished, setFinished] = useState(false);

  const progress = useRef(0);
  const step = useRef<"close" | "open" | "pause">("close");
  const count = 6;
  const bodies = useRef<SVGGElement>(null);
  const edges = useRef<SVGGElement>(null);

  let r = 167;

  const arc = (x: number, y: number, s: number) =>
    `A${r},${r},0,0,${s},${x},${y}`;

  const path = (i: number, d: string) =>
    `<path transform='rotate(${(i / +count) * 360})' ${d}></path>`;

  const upd = (val: number) => {
    if (!edges.current || !bodies.current) return;

    let step = Math.PI * (0.5 + 2 / +count);
    let p1x = Math.cos(step) * r;
    let p1y = Math.sin(step) * r;
    let cos = Math.cos(-val);
    let sin = Math.sin(-val);
    let c1x = p1x - cos * p1x - sin * p1y;
    let c1y = p1y - cos * p1y + sin * p1x;
    let dx = -sin * r - c1x;
    let dy = r - cos * r - c1y;
    let dc = Math.sqrt(dx * dx + dy * dy);
    let a = Math.atan2(dy, dx) - Math.acos(dc / 2 / r);
    let x = c1x + Math.cos(a) * r;
    let y = c1y + Math.sin(a) * r;

    let edge = `M${p1x},${p1y}${arc(0, r, 0)}${arc(x, y, 1)}`;

    edges.current.innerHTML = bodies.current.innerHTML = "";
    for (let i = 0; i < +count; i++) {
      edges.current.innerHTML += path(
        i,
        `fill=none stroke=#3e3e3e d='${edge}'`,
      );
      bodies.current.innerHTML += path(
        i,
        `fill=#1a1a1a d='${edge}${arc(p1x, p1y, 0)}'`,
      );
    }
  };

  useEffect(() => {
    upd(progress.current);

    let frame: number;
    let timeout: NodeJS.Timeout;

    const animate = () => {
      if (step.current === "close") {
        if (progress.current <= 1) {
          progress.current += progress.current < 0.8 ? 0.2 : 0.08;
          upd(progress.current);
        } else {
          step.current = "pause";
          progress.current = 1;
        }
        frame = requestAnimationFrame(animate);
      } else if (step.current === "open") {
        if (progress.current > 0.01) {
          progress.current -= progress.current > 0.2 ? 0.2 : 0.08;
          upd(progress.current);
          frame = requestAnimationFrame(animate);
        } else {
          progress.current = 0;
          upd(0);
          cancelAnimationFrame(frame);
          setFinished(true);
        }
      } else if (step.current === "pause") {
        timeout = setTimeout(() => {
          clearTimeout(timeout);
          upd(1);
          step.current = "open";
        }, 250);
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (soundEffect) {
      const audio = new Audio(cameraShutter);
      audio
        .play()
        .catch((error) => console.error("Audio playback failed:", error));
    }
  }, [soundEffect]);

  return !finished ? (
    <svg
      viewBox="-100 -100 200 200"
      className="pointer-events-none absolute left-1/2 top-1/2 z-[1000] aspect-square h-full w-full -translate-x-1/2 -translate-y-1/2"
    >
      <g ref={bodies}></g>
      <g ref={edges}></g>
    </svg>
  ) : null;
}
