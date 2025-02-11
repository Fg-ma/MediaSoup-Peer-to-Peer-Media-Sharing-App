import React from "react";

export default function CreditSection({
  title,
  creditItems,
}: {
  title: string;
  creditItems: React.ReactElement[];
}) {
  return (
    <>
      <div className='flex text-fg-white text-2xl font-K2D w-max flex-col items-center justify-center'>
        {title}
        <div className='w-[115%] h-1 rounded-[2px] bg-fg-red-light'></div>
      </div>
      {creditItems.map((item, index) =>
        React.cloneElement(item, { key: item.key || index })
      )}
    </>
  );
}
