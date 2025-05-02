import { tableTopCeph, tableTopMongo } from "../index";
import { contentTypeBucketMap, onDeleteContentType } from "../typeConstant";

class Cleanup {
  constructor() {}

  onDeleteContent = async (event: onDeleteContentType) => {
    const { userId, contentType, contentId } = event.header;
    const { filename } = event.data;

    await tableTopCeph.deleteFile(contentTypeBucketMap[contentType], filename);

    await tableTopMongo.deleteUserDocument(userId, contentType, contentId);
  };
}

export default Cleanup;
