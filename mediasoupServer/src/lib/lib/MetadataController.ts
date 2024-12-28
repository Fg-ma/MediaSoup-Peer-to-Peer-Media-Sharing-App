import { Server as SocketIOServer } from "socket.io";
import {
  onBundleMetadataResponseType,
  onRequestBundleMetadataType,
  onRequestCatchUpDataType,
  onRequestGameCatchUpDataType,
  onResponseCatchUpDataType,
  onResponseGameCatchUpDataType,
} from "../mediasoupTypes";
import { tableProducers } from "../mediasoupVars";

class MetadataController {
  constructor(private io: SocketIOServer) {}

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

    this.io
      .to(`instance_${table_id}_${inquiredUsername}_${inquiredInstance}`)
      .emit("message", msg);
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

    this.io
      .to(`instance_${table_id}_${inquiringUsername}_${inquiringInstance}`)
      .emit("message", msg);
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

    this.io
      .to(`instance_${table_id}_${inquiredUsername}_${inquiredInstance}`)
      .emit("message", msg);
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
      this.io
        .to(`instance_${table_id}_${validUser.username}_${validUser.instance}`)
        .emit("message", msg);
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

    this.io
      .to(`instance_${table_id}_${inquiringUsername}_${inquiringInstance}`)
      .emit("message", msg);
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
    this.io
      .to(`instance_${table_id}_${inquiringUsername}_${inquiringInstance}`)
      .emit("message", msg);
  };
}

export default MetadataController;
