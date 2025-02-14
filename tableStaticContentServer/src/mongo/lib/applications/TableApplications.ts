import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";

class TableApplications {
  private tableApplicationsCollection: Collection;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.tableApplicationsCollection = this.db.collection("tableApplications");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.tableApplicationsCollection, this.decoder);
    this.uploads = new Uploads(this.tableApplicationsCollection, this.encoder);
    this.deletes = new Deletes(this.tableApplicationsCollection);
  }
}

export default TableApplications;
