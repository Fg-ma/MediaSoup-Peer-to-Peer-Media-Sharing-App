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

  onRequestGameCatchUpData = (event: onRequestGameCatchUpDataType) => {
    const { table_id, inquiringUsername, inquiringInstance, gameId } = event;

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
        inquiringUsername: inquiringUsername,
        inquiringInstance: inquiringInstance,
        gameId: gameId,
      };
      this.io
        .to(`instance_${table_id}_${validUser.username}_${validUser.instance}`)
        .emit("message", msg);
    }
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

  onResponseGameCatchUpData = (event: onResponseGameCatchUpDataType) => {
    const {
      table_id,
      inquiringUsername,
      inquiringInstance,
      gameId,
      positioning,
    } = event;

    const msg = {
      type: "responsedGameCatchUpData",
      gameId,
      positioning: positioning,
    };
    this.io
      .to(`instance_${table_id}_${inquiringUsername}_${inquiringInstance}`)
      .emit("message", msg);
  };
}

export default MetadataController;
