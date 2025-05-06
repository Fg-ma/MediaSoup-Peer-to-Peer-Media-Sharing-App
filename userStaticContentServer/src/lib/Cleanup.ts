import { tableTopCeph, tableTopMongo } from "../index";
import { contentTypeBucketMap, onDeleteContentType } from "../typeConstant";

class Cleanup {
  constructor() {}

  onDeleteContent = async (event: onDeleteContentType) => {
    const { userId, contentType, contentId } = event.header;

    await tableTopCeph.deletes.deleteFile(
      contentTypeBucketMap[contentType],
      contentId
    );

    await tableTopMongo.deleteUserDocument(userId, contentType, contentId);
  };
}

export default Cleanup;
