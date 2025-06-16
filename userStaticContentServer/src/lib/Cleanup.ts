import { z } from "zod";
import { tableTopCeph, tableTopMongo, sanitizationUtils } from "../index";
import { contentTypeBucketMap, onDeleteContentType } from "../typeConstant";
import { StaticContentTypesArray } from "../../../universal/contentTypeConstant";

class Cleanup {
  constructor() {}

  private deleteContentSchema = z.object({
    type: z.literal("deleteContent"),
    header: z.object({
      userId: z.string(),
      contentType: z.enum(StaticContentTypesArray),
      contentId: z.string(),
    }),
    data: z.object({
      name: z.string(),
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
    const { userId, contentType, contentId } = safeEvent.header;

    await tableTopCeph.deletes.deleteFile(
      contentTypeBucketMap[contentType],
      contentId
    );

    await tableTopMongo.deleteUserDocument(userId, contentType, contentId);
  };
}

export default Cleanup;
