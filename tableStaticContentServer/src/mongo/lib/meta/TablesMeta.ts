import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";

class TablesMeta {
  private tablesMetaCollection: Collection;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.tablesMetaCollection = this.db.collection("tablesMeta");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.tablesMetaCollection, this.decoder);
    this.uploads = new Uploads(this.tablesMetaCollection, this.encoder);
    this.deletes = new Deletes(this.tablesMetaCollection);
  }
}

export default TablesMeta;
