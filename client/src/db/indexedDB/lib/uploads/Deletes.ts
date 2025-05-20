import { IDBPDatabase } from "idb";
import { HandleListenerTypes, UploadDBSchema } from "./typeConstant";

class Deletes {
  constructor(
    private uploadDB: IDBPDatabase<UploadDBSchema>,
    private handleListeners: Set<
      (message: HandleListenerTypes) => void
    > = new Set(),
  ) {}

  deleteFileHandle = async (key: string) => {
    await this.uploadDB.getAllKeys("handles");
    await this.uploadDB?.delete("handles", key);

    this.handleListeners.forEach((listener) => {
      listener({
        type: "handleDeleted",
        header: {
          key,
        },
      });
    });
  };
}

export default Deletes;
