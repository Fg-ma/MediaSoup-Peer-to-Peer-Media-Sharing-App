import React, { useEffect, useRef } from "react";

export default function FgSVG({
  src,
  attributes,
  className,
}: {
  src: string;
  attributes?: { key: string; value: string; id?: string }[];
  className?: string;
}) {
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSVG = async () => {
      try {
        const response = await fetch(src);
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.documentElement;

        // Apply attributes from props
        if (attributes) {
          attributes.forEach(({ key, value, id }) => {
            if (id === undefined) {
              svgElement.setAttribute(key, value);
            } else {
              const element = svgDoc.getElementById(id);
              if (element) {
                element.setAttribute(key, value);
              }
            }
          });
        }

        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = "";
          svgContainerRef.current.appendChild(svgElement);
        }
      } catch (error) {
        console.error("Error fetching SVG:", error);
      }
    };

    fetchSVG();
  }, [src, attributes]);

  return <div className={className} ref={svgContainerRef} />;
}
