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
    } = event.data;

    const msg = {
      type: "bundleMetadataRequested",
      data: {
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
      clientMute,
      streamEffects,
      currentEffectsStyles,
    } = event.data;

    const msg = {
      type: "bundleMetadataResponsed",
      data: {
        inquiredUsername,
        inquiredInstance,
        clientMute,
        streamEffects,
        currentEffectsStyles,
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
    } = event.data;

    const msg = {
      type: "requestedCatchUpData",
      data: {
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
      event.data;

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
        data: {
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
      data,
    } = event.data;

    const msg = {
      type: "responsedCatchUpData",
      data: {
        inquiredUsername,
        inquiredInstance,
        inquiredType,
        inquiredProducerId,
        data,
      },
    };

    this.io
      .to(`instance_${table_id}_${inquiringUsername}_${inquiringInstance}`)
      .emit("message", msg);
  };

  onResponseGameCatchUpData = (event: onResponseGameCatchUpDataType) => {
    const {
      table_id,
      inquiringUsername,
      inquiringInstance,
      gameId,
      positioning,
    } = event.data;

    const msg = {
      type: "responsedGameCatchUpData",
      data: {
        gameId,
        positioning,
      },
    };
    this.io
      .to(`instance_${table_id}_${inquiringUsername}_${inquiringInstance}`)
      .emit("message", msg);
  };
}

export default MetadataController;
