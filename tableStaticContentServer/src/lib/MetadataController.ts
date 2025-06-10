import { sanitizationUtils, tableTopMongo, tableTopRedis } from "src";
import {
  onChangeContentStateType,
  onCreateNewInstancesType,
  onDeleteUploadSessionType,
  onRequestCatchUpEffectsType,
  onRequestCatchUpTableDataType,
  onSignalReuploadStartType,
  onUpdateContentEffectsType,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import { UploadSession } from "src/posts/lib/typeConstant";

class MetadataController {
  constructor(private broadcaster: Broadcaster) {}

  onRequestCatchUpTableData = async (event: onRequestCatchUpTableDataType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRequestCatchUpTableDataType;
    const { tableId, username, instance } = safeEvent.header;

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
    const safeEvent = sanitizationUtils.sanitizeObject(
      event,
      {
        color: "#",
      },
      ["color"]
    ) as onUpdateContentEffectsType;
    tableTopMongo.onUpdateContentEffects(safeEvent);

    const { tableId, contentType, contentId, instanceId } = safeEvent.header;

    const msg = {
      type: "updatedContentEffects",
      header: { contentType, contentId, instanceId },
      data: safeEvent.data,
    };
    this.broadcaster.broadcastToTable(tableId, msg);
  };

  onRequestCatchUpEffects = async (event: onRequestCatchUpEffectsType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRequestCatchUpEffectsType;
    const { tableId, username, instance, contentType, contentId, instanceId } =
      safeEvent.header;

    let data: { effects?: object; effectStyles?: object } | undefined =
      undefined;

    switch (contentType) {
      case "image": {
        const imageData =
          await tableTopMongo.tableImages?.gets.getImageMetaDataBy_TID_IID(
            tableId,
            contentId
          );
        const filtered = imageData?.instances.filter(
          (instance) => instance.imageInstanceId === instanceId
        );
        if (filtered)
          data = {
            effects: filtered[0].effects,
            effectStyles: filtered[0].effectStyles,
          };
        break;
      }
      case "application": {
        const applicationData =
          await tableTopMongo.tableApplications?.gets.getApplicationMetaDataBy_TID_IID(
            tableId,
            contentId
          );
        const filtered = applicationData?.instances.filter(
          (instance) => instance.applicationInstanceId === instanceId
        );
        if (filtered)
          data = {
            effects: filtered[0].effects,
            effectStyles: filtered[0].effectStyles,
          };
        break;
      }
      case "soundClip": {
        const soundClipData =
          await tableTopMongo.tableSoundClips?.gets.getSoundClipMetaDataBy_TID_SID(
            tableId,
            contentId
          );
        const filtered = soundClipData?.instances.filter(
          (instance) => instance.soundClipInstanceId === instanceId
        );
        if (filtered)
          data = {
            effects: filtered[0].effects,
          };
        break;
      }
      case "svg": {
        const svgData =
          await tableTopMongo.tableSvgs?.gets.getSvgMetaDataBy_TID_SID(
            tableId,
            contentId
          );
        const filtered = svgData?.instances.filter(
          (instance) => instance.svgInstanceId === instanceId
        );
        if (filtered)
          data = {
            effects: filtered[0].effects,
            effectStyles: filtered[0].effectStyles,
          };
        break;
      }
      case "text": {
        const textData =
          await tableTopMongo.tableText?.gets.getTextMetaDataBy_TID_XID(
            tableId,
            contentId
          );
        const filtered = textData?.instances.filter(
          (instance) => instance.textInstanceId === instanceId
        );
        if (filtered)
          data = {
            effectStyles: filtered[0].effectStyles,
          };
        break;
      }
      case "video": {
        const videoData =
          await tableTopMongo.tableVideos?.gets.getVideoMetaDataBy_TID_VID(
            tableId,
            contentId
          );
        const filtered = videoData?.instances.filter(
          (instance) => instance.videoInstanceId === instanceId
        );
        if (filtered)
          data = {
            effects: filtered[0].effects,
            effectStyles: filtered[0].effectStyles,
          };
        break;
      }
      default:
        break;
    }

    if (data === undefined) return;

    const msg = {
      type: "respondedCatchUpEffects",
      header: { contentType, contentId, instanceId },
      data: data,
    };
    this.broadcaster.broadcastToInstance(tableId, username, instance, msg);
  };

  onChangeContentState = (event: onChangeContentStateType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onChangeContentStateType;
    tableTopMongo.onChangeTableContentState(safeEvent);

    const { tableId, contentType, contentId } = safeEvent.header;

    const msg = {
      type: "contentStateChanged",
      header: { contentType, contentId },
      data: safeEvent.data,
    };
    this.broadcaster.broadcastToTable(tableId, msg);
  };

  onCreateNewInstances = (event: onCreateNewInstancesType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onCreateNewInstancesType;
    tableTopMongo.onCreateNewInstances(safeEvent);

    const { tableId } = safeEvent.header;
    const { updates } = safeEvent.data;

    this.broadcaster.broadcastToTable(tableId, {
      type: "createdNewInstances",
      data: {
        newInstances: updates,
      },
    });
  };

  onDeleteUploadSession = async (event: onDeleteUploadSessionType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onDeleteUploadSessionType;
    const { uploadId } = safeEvent.header;

    const session = (await tableTopRedis.gets.get(
      "TSCUS",
      uploadId
    )) as UploadSession;

    await tableTopRedis.deletes.delete(
      [
        { prefix: "TSCUS", id: uploadId },
        { prefix: "TSCCS", id: uploadId },
        session?.direction === "reupload"
          ? { prefix: "TSCRU", id: session.contentId }
          : undefined,
      ].filter((del) => del !== undefined)
    );
  };

  onSignalReuploadStart = async (event: onSignalReuploadStartType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onSignalReuploadStartType;
    const { tableId, contentId, contentType } = safeEvent.header;

    this.broadcaster.broadcastToTable(tableId, {
      type: "reuploadStarted",
      header: {
        contentType: contentType,
        contentId: contentId,
      },
    });
  };
}

export default MetadataController;
