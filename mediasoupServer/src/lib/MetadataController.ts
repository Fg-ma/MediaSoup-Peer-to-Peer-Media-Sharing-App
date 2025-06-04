import {
  onBundleMetadataResponseType,
  onRequestBundleMetadataType,
  onRequestCatchUpDataType,
  onResponseCatchUpDataType,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";

class MetadataController {
  constructor(private broadcaster: Broadcaster) {}

  onRequestBundleMetadata = (event: onRequestBundleMetadataType) => {
    const {
      tableId,
      inquiringUsername,
      inquiringInstance,
      inquiredUsername,
      inquiredInstance,
    } = event.header;

    const msg = {
      type: "bundleMetadataRequested",
      header: {
        inquiringUsername,
        inquiringInstance,
      },
    };

    this.broadcaster.broadcastToInstance(
      tableId,
      inquiredUsername,
      inquiredInstance,
      msg
    );
  };

  onBundleMetadataResponse = (event: onBundleMetadataResponseType) => {
    const {
      tableId,
      inquiringUsername,
      inquiringInstance,
      inquiredUsername,
      inquiredInstance,
    } = event.header;
    const { clientMute, streamEffects, userEffectsStyles } = event.data;

    const msg = {
      type: "bundleMetadataResponsed",
      header: {
        inquiredUsername,
        inquiredInstance,
      },
      data: {
        clientMute,
        streamEffects,
        userEffectsStyles,
      },
    };

    this.broadcaster.broadcastToInstance(
      tableId,
      inquiringUsername,
      inquiringInstance,
      msg
    );
  };

  onRequestCatchUpData = (event: onRequestCatchUpDataType) => {
    const {
      tableId,
      inquiringUsername,
      inquiringInstance,
      inquiredUsername,
      inquiredInstance,
      inquiredType,
      inquiredProducerId,
    } = event.header;

    const msg = {
      type: "requestedCatchUpData",
      header: {
        inquiringUsername,
        inquiringInstance,
        inquiredType,
        inquiredProducerId,
      },
    };

    this.broadcaster.broadcastToInstance(
      tableId,
      inquiredUsername,
      inquiredInstance,
      msg
    );
  };

  onResponseCatchUpData = (event: onResponseCatchUpDataType) => {
    const {
      tableId,
      inquiringUsername,
      inquiringInstance,
      inquiredUsername,
      inquiredInstance,
      inquiredType,
      inquiredProducerId,
    } = event.header;

    const msg = {
      type: "responsedCatchUpData",
      header: {
        inquiredUsername,
        inquiredInstance,
        inquiredType,
        inquiredProducerId,
      },
      data: event.data,
    };

    this.broadcaster.broadcastToInstance(
      tableId,
      inquiringUsername,
      inquiringInstance,
      msg
    );
  };
}

export default MetadataController;
