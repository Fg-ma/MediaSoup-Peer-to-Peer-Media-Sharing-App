import { openDB, IDBPDatabase } from "idb";
import {
  HandleListenerTypes,
  UploadDBSchema,
} from "./lib/uploads/typeConstant";
import Gets from "./lib/uploads/Gets";
import Posts from "./lib/uploads/Posts";
import Deletes from "./lib/uploads/Deletes";

class IndexedDB {
  uploadDB: undefined | IDBPDatabase<UploadDBSchema>;
  uploadGets: Gets | undefined;
  uploadPosts: Posts | undefined;
  uploadDeletes: Deletes | undefined;

  handleListeners: Set<(message: HandleListenerTypes) => void> = new Set();

  constructor() {
    void this.init();
  }

  init = async () => {
    this.uploadDB = await openDB("upload-db", 1, {
      upgrade(db) {
        db.createObjectStore("handles");
      },
    });

    this.uploadGets = new Gets(this.uploadDB);
    this.uploadPosts = new Posts(this.uploadDB, this.handleListeners);
    this.uploadDeletes = new Deletes(this.uploadDB, this.handleListeners);
  };

  addHandleObjStoreListener = (
    listener: (message: HandleListenerTypes) => void,
  ): void => {
    this.handleListeners.add(listener);
  };

  removeHandleObjStoreListener = (
    listener: (message: HandleListenerTypes) => void,
  ): void => {
    this.handleListeners.delete(listener);
  };
}

export default IndexedDB;
