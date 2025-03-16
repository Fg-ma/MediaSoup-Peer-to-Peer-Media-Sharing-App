import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";

class UserText {
  private userTextCollection: Collection;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.userTextCollection = this.db.collection("userText");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.userTextCollection, this.decoder);
    this.uploads = new Uploads(this.userTextCollection, this.encoder);
    this.deletes = new Deletes(this.userTextCollection);
  }
}

export default UserText;
