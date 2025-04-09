import React, { useEffect, useRef } from "react";
import "./lib/fgImageElement.css";

export default function FgImageElement({
  src,
  srcLoading,
  alt,
  className,
  style,
  ...props
}: {
  src: string;
  srcLoading?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const loaded = () => {
    if (containerRef.current) {
      containerRef.current.classList.add("loaded");
      containerRef.current.style.setProperty("background-image", "none");
    }
  };

  useEffect(() => {
    if (containerRef.current && srcLoading) {
      containerRef.current.style.setProperty(
        "--background-image",
        `url(${srcLoading})`,
      );
    }
  }, [srcLoading]);

  return (
    <div
      ref={containerRef}
      className={`${className} blurred-img`}
      style={{
        backgroundImage: `${srcLoading ? `url(${srcLoading})` : ""}`,
        ...style,
      }}
      {...props}
    >
      <img
        className="h-full w-full"
        ref={imgRef}
        src={src}
        onLoad={loaded}
        loading="lazy"
        alt={alt}
        {...props}
      />
    </div>
  );
}
