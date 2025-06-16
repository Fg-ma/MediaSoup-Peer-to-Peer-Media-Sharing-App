import { z } from "zod";
import {
  sanitizationUtils,
  tableTopCeph,
  tableTopMongo,
  tableTopRedis,
} from "../index";
import Broadcaster from "./Broadcaster";
import { contentTypeBucketMap, onDeleteContentType } from "../typeConstant";
import { StaticContentTypesArray } from "../../../universal/contentTypeConstant";

class Cleanup {
  constructor(private broadcaster: Broadcaster) {}

  private deleteContentSchema = z.object({
    type: z.literal("deleteContent"),
    header: z.object({
      tableId: z.string(),
      contentType: z.enum(StaticContentTypesArray),
      contentId: z.string(),
      instanceId: z.string(),
    }),
  });

  onDeleteContent = async (event: onDeleteContentType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onDeleteContentType;
    const validation = this.deleteContentSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, contentType, contentId, instanceId } = safeEvent.header;

    const document = await tableTopMongo.deleteTableDocumentInstance(
      tableId,
      contentType,
      contentId,
      instanceId
    );

    this.broadcaster.broadcastToTable(tableId, {
      type: "contentDeleted",
      header: {
        contentType,
        contentId,
        instanceId,
      },
    });

    if (contentType === "text") {
      await tableTopRedis.deletes.deleteKeys([
        `LTE:${tableId}:${contentId}:${instanceId}`,
      ]);
    }

    if (contentType === "video") {
      await tableTopRedis.deletes.deleteKeys([
        `VVM:${tableId}:${contentId}:${instanceId}`,
      ]);
    }

    if (document && document.i.length === 0 && !document.s.includes(0)) {
      if (contentType === "video") {
        const listed = await tableTopCeph.gets.listObjects(
          "table-videos",
          `${contentId}/`
        );

        if (!listed || listed.length === 0) return;

        for (const obj of listed) {
          if (!obj.Key) return;
          await tableTopCeph.deletes.deleteFile("table-videos", obj.Key);
        }
      } else {
        await tableTopCeph.deletes.deleteFile(
          contentTypeBucketMap[contentType],
          contentId
        );
      }

      await tableTopMongo.deleteTableDocument(tableId, contentType, contentId);

      if (contentType === "text") {
        await tableTopRedis.deletes.deleteKeys([
          `LTE:${tableId}:${contentId}:file`,
        ]);
      }
    }
  };
}

export default Cleanup;
