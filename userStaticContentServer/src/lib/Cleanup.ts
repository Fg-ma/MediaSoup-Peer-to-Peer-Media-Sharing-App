import { tableTopCeph, tableTopMongo, sanitizationUtils } from "../index";
import { contentTypeBucketMap, onDeleteContentType } from "../typeConstant";

class Cleanup {
  constructor() {}

  onDeleteContent = async (event: onDeleteContentType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onDeleteContentType;
    const { userId, contentType, contentId } = safeEvent.header;

    await tableTopCeph.deletes.deleteFile(
      contentTypeBucketMap[contentType],
      contentId
    );

    await tableTopMongo.deleteUserDocument(userId, contentType, contentId);
  };
}

export default Cleanup;
