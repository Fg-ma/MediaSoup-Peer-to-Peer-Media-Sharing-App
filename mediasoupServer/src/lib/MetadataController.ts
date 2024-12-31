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
      table_id,
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
      table_id,
      inquiredUsername,
      inquiredInstance,
      msg
    );
  };

  onBundleMetadataResponse = (event: onBundleMetadataResponseType) => {
    const {
      table_id,
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
      table_id,
      inquiringUsername,
      inquiringInstance,
      msg
    );
  };

  onRequestCatchUpData = (event: onRequestCatchUpDataType) => {
    const {
      table_id,
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
      table_id,
      inquiredUsername,
      inquiredInstance,
      msg
    );
  };

  onRequestGameCatchUpData = (event: onRequestGameCatchUpDataType) => {
    const { table_id, inquiringUsername, inquiringInstance, gameId } =
      event.header;

    let validUser: { username: string; instance: string } | undefined =
      undefined;

    for (const username in tableProducers[table_id]) {
      if (username !== inquiringUsername) {
        for (const instance in tableProducers[table_id][username]) {
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
        table_id,
        validUser.username,
        validUser.instance,
        msg
      );
    }
  };

  onResponseCatchUpData = (event: onResponseCatchUpDataType) => {
    const {
      table_id,
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
      table_id,
      inquiringUsername,
      inquiringInstance,
      msg
    );
  };

  onResponseGameCatchUpData = (event: onResponseGameCatchUpDataType) => {
    const { table_id, inquiringUsername, inquiringInstance, gameId } =
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
      table_id,
      inquiringUsername,
      inquiringInstance,
      msg
    );
  };
}

export default MetadataController;
