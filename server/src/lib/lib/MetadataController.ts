import { Server as SocketIOServer } from "socket.io";
import {
  onBundleMetadataResponseType,
  onRequestBundleMetadataType,
  onRequestCatchUpDataType,
  onResponseCatchUpDataType,
} from "../mediasoupTypes";

class MetadataController {
  constructor(private io: SocketIOServer) {}

  onRequestBundleMetadata = (event: onRequestBundleMetadataType) => {
    const msg = {
      type: "bundleMetadataRequested",
      inquiringUsername: event.inquiringUsername,
      inquiringInstance: event.inquiringInstance,
    };

    this.io
      .to(
        `instance_${event.table_id}_${event.inquiredUsername}_${event.inquiredInstance}`
      )
      .emit("message", msg);
  };

  onBundleMetadataResponse = (event: onBundleMetadataResponseType) => {
    const msg = {
      type: "bundleMetadataResponsed",
      inquiredUsername: event.inquiredUsername,
      inquiredInstance: event.inquiredInstance,
      data: event.data,
    };

    this.io
      .to(
        `instance_${event.table_id}_${event.inquiringUsername}_${event.inquiringInstance}`
      )
      .emit("message", msg);
  };

  onRequestCatchUpData = (event: onRequestCatchUpDataType) => {
    const msg = {
      type: "requestedCatchUpData",
      inquiringUsername: event.inquiringUsername,
      inquiringInstance: event.inquiringInstance,
      inquiredType: event.inquiredType,
      inquiredProducerId: event.inquiredProducerId,
    };
    this.io
      .to(
        `instance_${event.table_id}_${event.inquiredUsername}_${event.inquiredInstance}`
      )
      .emit("message", msg);
  };

  onResponseCatchUpData = (event: onResponseCatchUpDataType) => {
    const msg = {
      type: "responsedCatchUpData",
      inquiredUsername: event.inquiredUsername,
      inquiredInstance: event.inquiredInstance,
      inquiredType: event.inquiredType,
      inquiredProducerId: event.inquiredProducerId,
      data: event.data,
    };
    this.io
      .to(
        `instance_${event.table_id}_${event.inquiringUsername}_${event.inquiringInstance}`
      )
      .emit("message", msg);
  };
}

export default MetadataController;
