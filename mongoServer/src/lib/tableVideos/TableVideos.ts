import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";
import { TableVideosType } from "./typeConstant";

class TableVideos {
  private tableVideosCollection: Collection<TableVideosType>;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.tableVideosCollection = this.db.collection("tableVideos");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.tableVideosCollection, this.decoder);
    this.uploads = new Uploads(this.tableVideosCollection, this.encoder);
    this.deletes = new Deletes(this.tableVideosCollection);
  }
}

export default TableVideos;
