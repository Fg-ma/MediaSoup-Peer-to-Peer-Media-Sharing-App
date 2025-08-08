import React, { useState } from "react";
import FgButton from "../../elements/fgButton/FgButton";

export default function CreditSection({
  id,
  title,
  creditItems,
}: {
  id: string;
  title: string;
  creditItems: React.ReactElement[];
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <FgButton
        externalId={id}
        contentFunction={() => (
          <div className="flex w-max flex-col items-center justify-center font-K2D text-2xl text-fg-white">
            {title}
            <div className="h-1 w-[115%] rounded-[2px] bg-fg-red-light"></div>
          </div>
        )}
        clickFunction={() => setIsOpen((prev) => !prev)}
      />
      {isOpen &&
        creditItems.map((item, index) =>
          React.cloneElement(item, { key: item.key || index }),
        )}
    </>
  );
}
