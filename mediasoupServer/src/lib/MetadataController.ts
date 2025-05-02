import {
  onBundleMetadataResponseType,
  onRequestBundleMetadataType,
  onRequestCatchUpDataType,
  onRequestGameCatchUpDataType,
  onResponseCatchUpDataType,
  onResponseGameCatchUpDataType,
  tableProducers,
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

  onRequestGameCatchUpData = (event: onRequestGameCatchUpDataType) => {
    const { tableId, inquiringUsername, inquiringInstance, gameId } =
      event.header;

    let validUser: { username: string; instance: string } | undefined =
      undefined;

    for (const username in tableProducers[tableId]) {
      if (username !== inquiringUsername) {
        for (const instance in tableProducers[tableId][username]) {
          if (instance !== inquiringInstance) {
            validUser = { username, instance };
          }
        }
      }
    }

    if (validUser) {
      const msg = {
        type: "requestedGameCatchUpData",
        header: {
          inquiringUsername,
          inquiringInstance,
          gameId,
        },
      };
      this.broadcaster.broadcastToInstance(
        tableId,
        validUser.username,
        validUser.instance,
        msg
      );
    }
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

  onResponseGameCatchUpData = (event: onResponseGameCatchUpDataType) => {
    const { tableId, inquiringUsername, inquiringInstance, gameId } =
      event.header;
    const { positioning } = event.data;

    const msg = {
      type: "responsedGameCatchUpData",
      header: {
        gameId,
      },
      data: {
        positioning,
      },
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
