import { tableTopMongo, tableTopRedis } from "src";
import {
  onChangeContentStateType,
  onCreateNewInstancesType,
  onDeleteUploadSessionType,
  onRequestCatchUpTableDataType,
  onRequestCatchUpVideoPositionType,
  onResponseCatchUpVideoPositionType,
  onUpdateContentEffectsType,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import { onUpdateVideoPositionType } from "../../../mongoServer/src/typeConstant";

class MetadataController {
  constructor(private broadcaster: Broadcaster) {}

  onRequestCatchUpTableData = async (event: onRequestCatchUpTableDataType) => {
    const { tableId, username, instance } = event.header;

    const images = await tableTopMongo.tableImages?.gets.getAllBy_TID(tableId);
    const svgs = await tableTopMongo.tableSvgs?.gets.getAllBy_TID(tableId);
    const videos = await tableTopMongo.tableVideos?.gets.getAllBy_TID(tableId);
    const text = await tableTopMongo.tableText?.gets.getAllBy_TID(tableId);
    const soundClips = await tableTopMongo.tableSoundClips?.gets.getAllBy_TID(
      tableId
    );
    const applications =
      await tableTopMongo.tableApplications?.gets.getAllBy_TID(tableId);

    this.broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "responsedCatchUpTableData",
      data: { images, svgs, videos, text, soundClips, applications },
    });
  };

  onUpdateContentEffects = (event: onUpdateContentEffectsType) => {
    tableTopMongo.onUpdateContentEffects(event);

    const { tableId, contentType, contentId, instanceId } = event.header;

    const msg = {
      type: "updatedContentEffects",
      header: { contentType, contentId, instanceId },
      data: event.data,
    };
    this.broadcaster.broadcastToTable(tableId, msg);
  };

  onChangeContentState = (event: onChangeContentStateType) => {
    tableTopMongo.onChangeTableContentState(event);

    const { tableId, contentType, contentId } = event.header;

    const msg = {
      type: "contentStateChanged",
      header: { contentType, contentId },
      data: event.data,
    };
    this.broadcaster.broadcastToTable(tableId, msg);
  };

  onUpdateVideoPosition = async (event: onUpdateVideoPositionType) => {
    await tableTopMongo.onUpdateVideoPosition(event);

    const { tableId, contentType, contentId, instanceId } = event.header;
    const { videoPosition } = event.data;

    const msg = {
      type: "updatedVideoPosition",
      header: { contentType, contentId, instanceId },
      data: { videoPosition },
    };
    this.broadcaster.broadcastToTable(tableId, msg);
  };

  onRequestCatchUpVideoPosition = (
    event: onRequestCatchUpVideoPositionType
  ) => {
    const { tableId, username, instance, contentType, contentId, instanceId } =
      event.header;

    this.broadcaster.broadcastToFirstFoundInstance(tableId, {
      type: "requestedCatchUpVideoPosition",
      header: {
        username,
        instance,
        contentType,
        contentId,
        instanceId,
      },
    });
  };

  onResponseCatchUpVideoPosition = (
    event: onResponseCatchUpVideoPositionType
  ) => {
    const { tableId, username, instance, contentType, contentId, instanceId } =
      event.header;
    const { currentVideoPosition } = event.data;

    this.broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "respondedCatchUpVideoPosition",
      header: {
        contentType,
        contentId,
        instanceId,
      },
      data: {
        currentVideoPosition,
      },
    });
  };

  onCreateNewInstances = (event: onCreateNewInstancesType) => {
    tableTopMongo.onCreateNewInstances(event);

    const { tableId } = event.header;
    const { updates } = event.data;

    this.broadcaster.broadcastToTable(tableId, {
      type: "createdNewInstances",
      data: {
        newInstances: updates,
      },
    });
  };

  onDeleteUploadSession = async (event: onDeleteUploadSessionType) => {
    const { uploadId } = event.header;

    await tableTopRedis.deletes.delete([
      { prefix: "TSCUS", id: uploadId },
      { prefix: "TSCCS", id: uploadId },
    ]);
  };
}

export default MetadataController;
