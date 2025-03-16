import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";

class UserApplications {
  private userApplicationsCollection: Collection;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.userApplicationsCollection = this.db.collection("userApplications");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.userApplicationsCollection, this.decoder);
    this.uploads = new Uploads(this.userApplicationsCollection, this.encoder);
    this.deletes = new Deletes(this.userApplicationsCollection);
  }
}

export default UserApplications;
