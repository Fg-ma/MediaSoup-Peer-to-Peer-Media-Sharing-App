import React, { useEffect, useRef, useState } from "react";

export default function LazyScrollingContainerItem({
  scrollingContainerRef,
  item,
}: {
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  item: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const itemContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true); // Load the button when it's visible
            observer.unobserve(entry.target); // Stop observing once it's loaded
          }
        });
      },
      {
        root: scrollingContainerRef.current, // Container to observe within
        threshold: 0.1, // Trigger when 10% of the button is visible
      }
    );

    if (itemContainerRef.current) {
      observer.observe(itemContainerRef.current); // Start observing the button
    }

    return () => {
      if (itemContainerRef.current) {
        observer.unobserve(itemContainerRef.current); // Clean up observer on unmount
      }
    };
  }, [scrollingContainerRef, isVisible]);

  return (
    <div ref={itemContainerRef} className='w-full aspect-square'>
      {isVisible ? (
        item
      ) : (
        <div className='relative bg-gray-300 w-full aspect-square animate-pulse rounded'></div>
      )}
    </div>
  );
}
