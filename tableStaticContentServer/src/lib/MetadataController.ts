import { z } from "zod";
import { sanitizationUtils, tableTopMongo, tableTopRedis } from "src";
import {
  contentTypeBucketMap,
  encodedCephBucketMap,
  onChangeContentStateType,
  onCreateNewInstancesType,
  onDeleteUploadSessionType,
  onRequestCatchUpEffectsType,
  onRequestCatchUpTableDataType,
  onSignalReuploadStartType,
  onUpdateContentEffectsType,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import { UploadSession } from "../posts/lib/typeConstant";
import {
  StaticContentTypesArray,
  TableContentStateTypesArray,
} from "../../../universal/contentTypeConstant";
import {
  videoEffectStylesSchema,
  imageEffectStylesSchema,
  applicationEffectStylesSchema,
  svgEffectStylesSchema,
  textEffectStylesSchema,
} from "../../../universal/effectsTypeConstant";

class MetadataController {
  constructor(private broadcaster: Broadcaster) {}

  private requestCatchUpTableDataSchema = z.object({
    type: z.literal("requestCatchUpTableData"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
    }),
  });

  onRequestCatchUpTableData = async (event: onRequestCatchUpTableDataType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRequestCatchUpTableDataType;
    const validation = this.requestCatchUpTableDataSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
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

  private updateContentEffectsSchema = z.object({
    type: z.literal("updateContentEffects"),
    header: z.object({
      tableId: z.string(),
      contentType: z.enum(StaticContentTypesArray),
      contentId: z.string(),
      instanceId: z.string(),
    }),
    data: z.object({
      effects: z.record(z.boolean()).optional(),
      effectStyles: z
        .union([
          videoEffectStylesSchema,
          imageEffectStylesSchema,
          applicationEffectStylesSchema,
          svgEffectStylesSchema,
          textEffectStylesSchema,
        ])
        .optional(),
    }),
  });

  onUpdateContentEffects = (event: onUpdateContentEffectsType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event,
      {
        color: "#",
      },
      ["color"]
    ) as onUpdateContentEffectsType;
    const validation = this.updateContentEffectsSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    tableTopMongo.onUpdateContentEffects(safeEvent);

    const { tableId, contentType, contentId, instanceId } = safeEvent.header;

    const msg = {
      type: "updatedContentEffects",
      header: { contentType, contentId, instanceId },
      data: safeEvent.data,
    };
    this.broadcaster.broadcastToTable(tableId, msg);
  };

  private requestCatchUpEffectsSchema = z.object({
    type: z.literal("requestCatchUpEffects"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      contentType: z.enum(StaticContentTypesArray),
      contentId: z.string(),
      instanceId: z.string(),
    }),
  });

  onRequestCatchUpEffects = async (event: onRequestCatchUpEffectsType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRequestCatchUpEffectsType;
    const validation = this.requestCatchUpEffectsSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
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

  private changeContentStateSchema = z.object({
    type: z.literal("changeContentState"),
    header: z.object({
      tableId: z.string(),
      contentType: z.enum(StaticContentTypesArray),
      contentId: z.string(),
    }),
    data: z.object({
      state: z.array(z.enum(TableContentStateTypesArray)),
    }),
  });

  onChangeContentState = (event: onChangeContentStateType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onChangeContentStateType;
    const validation = this.changeContentStateSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    tableTopMongo.onChangeTableContentState(safeEvent);

    const { tableId, contentType, contentId } = safeEvent.header;

    const msg = {
      type: "contentStateChanged",
      header: { contentType, contentId },
      data: safeEvent.data,
    };
    this.broadcaster.broadcastToTable(tableId, msg);
  };

  private createNewInstancesSchema = z.object({
    type: z.literal("createNewInstances"),
    header: z.object({
      tableId: z.string(),
    }),
    data: z.object({
      updates: z.array(
        z.object({
          contentType: z.enum(StaticContentTypesArray),
          contentId: z.string(),
          instances: z.array(
            z.object({
              instanceId: z.string(),
              positioning: z.object({
                position: z.object({
                  left: z.number(),
                  top: z.number(),
                }),
                scale: z.object({
                  x: z.number(),
                  y: z.number(),
                }),
                rotation: z.number(),
              }),
            })
          ),
        })
      ),
    }),
  });

  onCreateNewInstances = (event: onCreateNewInstancesType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onCreateNewInstancesType;
    const validation = this.createNewInstancesSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
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

  private deleteUploadSessionSchema = z.object({
    type: z.literal("deleteUploadSession"),
    header: z.object({
      uploadId: z.string(),
      contentId: z.string(),
      contentType: z.enum(StaticContentTypesArray),
    }),
  });

  onDeleteUploadSession = async (event: onDeleteUploadSessionType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onDeleteUploadSessionType;
    const validation = this.deleteUploadSessionSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { uploadId, contentId, contentType } = safeEvent.header;

    const session = (await tableTopRedis.gets.get(
      "TSCUS",
      `${
        encodedCephBucketMap[contentTypeBucketMap[contentType]]
      }:${contentId}:${uploadId}`
    )) as UploadSession;

    await tableTopRedis.deletes.delete(
      [
        {
          prefix: "TSCUS",
          id: `${
            encodedCephBucketMap[contentTypeBucketMap[contentType]]
          }:${contentId}:${uploadId}`,
        },
        { prefix: "TSCCS", id: uploadId },
        session?.direction === "reupload"
          ? { prefix: "TSCRU", id: contentId }
          : undefined,
      ].filter((del) => del !== undefined)
    );
  };

  private signalReuploadStartSchema = z.object({
    type: z.literal("signalReuploadStart"),
    header: z.object({
      tableId: z.string(),
      contentType: z.enum(StaticContentTypesArray),
      contentId: z.string(),
    }),
  });

  onSignalReuploadStart = async (event: onSignalReuploadStartType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onSignalReuploadStartType;
    const validation = this.signalReuploadStartSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
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
