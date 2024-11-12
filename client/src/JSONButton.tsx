import React from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import FgButton from "./fgButton/FgButton";

export default function JSONButton({
  table_id,
  username,
  instance,
  device,
  socket,
  isJSON,
  setJSONActive,
}: {
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
  device: React.MutableRefObject<mediasoup.types.Device | undefined>;
  socket: React.MutableRefObject<Socket>;
  isJSON: React.MutableRefObject<boolean>;
  setJSONActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const clickFunction = () => {
    if (!table_id.current || !username.current) {
      console.error("Missing table_id or username!");
      return;
    }

    isJSON.current = !isJSON.current;
    setJSONActive((prev) => !prev);

    if (isJSON.current) {
      if (device.current) {
        const msg = {
          type: "createProducerTransport",
          forceTcp: false,
          rtpCapabilities: device.current.rtpCapabilities,
          producerType: "json",
          table_id: table_id.current,
          username: username.current,
          instance: instance.current,
        };
        socket.current.emit("message", msg);
      }
    } else if (!isJSON.current) {
      const msg = {
        type: "removeProducer",
        table_id: table_id.current,
        username: username.current,
        instance: instance.current,
        producerType: "json",
        producerId: "producerMetaData",
      };

      socket.current.emit("message", msg);
    }
  };

  return (
    <FgButton className='w-10 h-10 bg-blue-700' clickFunction={clickFunction} />
  );
}
