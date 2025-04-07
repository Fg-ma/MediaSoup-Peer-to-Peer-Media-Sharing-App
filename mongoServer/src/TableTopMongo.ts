import { MongoClient, Db } from "mongodb";
import TableImages from "./lib/tableImages/TableImages";
import TableVideos from "./lib/tableVideos/TableVideos";
import TableSoundClips from "./lib/tableSoundClips/TableSoundClips";
import TableApplications from "./lib/tableApplications/TableApplications";
import TableText from "./lib/tableText/TableText";
import {
  onChangeContentStateType,
  onUpdateContentEffectsType,
  onUpdateContentPositioningType,
  onUpdateVideoPositionType,
} from "./typeConstant";
import TablesMeta from "./lib/tableMeta/TablesMeta";
import { StaticContentTypes } from "../../universal/contentTypeConstant";
import UserImages from "./lib/userImages/UserImages";
import UserVideos from "./lib/userVideos/UserVideos";
import UserSoundClips from "./lib/userSoundClips/UserSoundClips";
import UserApplications from "./lib/userApplications/UserApplications";
import UserText from "./lib/userText/UserText";
import TableSvgs from "./lib/tableSvgs/TableSvgs";
import UserSvgs from "./lib/userSvgs/UserSvgs";
import {
  ApplicationEffectStylesType,
  ImageEffectStylesType,
  SvgEffectStylesType,
  VideoEffectStylesType,
} from "../../universal/effectsTypeConstant";

const uri = "mongodb://localhost:27017";
const dbName = "tableTopMongo";

class TableTopMongo {
  private client: MongoClient | undefined;
  private db: Db | undefined;

  tablesMeta: TablesMeta | undefined;
  tableImages: TableImages | undefined;
  tableVideos: TableVideos | undefined;
  tableSoundClips: TableSoundClips | undefined;
  tableApplications: TableApplications | undefined;
  tableText: TableText | undefined;
  tableSvgs: TableSvgs | undefined;
  userImages: UserImages | undefined;
  userVideos: UserVideos | undefined;
  userSoundClips: UserSoundClips | undefined;
  userApplications: UserApplications | undefined;
  userText: UserText | undefined;
  userSvgs: UserSvgs | undefined;

  constructor() {
    this.getDbConnection();
  }

  destructor = () => {
    this.client?.close();
  };

  private getDbConnection = async () => {
    this.client = new MongoClient(uri);

    await this.client.connect();

    this.db = this.client.db(dbName);

    this.tablesMeta = new TablesMeta(this.db);
    this.tableImages = new TableImages(this.db);
    this.tableVideos = new TableVideos(this.db);
    this.tableSoundClips = new TableSoundClips(this.db);
    this.tableApplications = new TableApplications(this.db);
    this.tableText = new TableText(this.db);
    this.tableSvgs = new TableSvgs(this.db);
    this.userImages = new UserImages(this.db);
    this.userVideos = new UserVideos(this.db);
    this.userSoundClips = new UserSoundClips(this.db);
    this.userApplications = new UserApplications(this.db);
    this.userText = new UserText(this.db);
    this.userSvgs = new UserSvgs(this.db);
  };

  deleteTableDocument = async (
    table_id: string,
    contentType: StaticContentTypes,
    contentId: string
  ) => {
    if (contentType === "image") {
      await this.tableImages?.deletes.deleteMetaDataBy_TID_IID(
        table_id,
        contentId
      );
    } else if (contentType === "svg") {
      await this.tableSvgs?.deletes.deleteMetaDataBy_TID_SID(
        table_id,
        contentId
      );
    } else if (contentType === "video") {
      await this.tableVideos?.deletes.deleteMetaDataBy_TID_VID(
        table_id,
        contentId
      );
    } else if (contentType === "application") {
      await this.tableApplications?.deletes.deleteMetaDataBy_TID_AID(
        table_id,
        contentId
      );
    } else if (contentType === "text") {
      await this.tableText?.deletes.deleteMetaDataBy_TID_XID(
        table_id,
        contentId
      );
    } else if (contentType === "soundClip") {
      await this.tableSoundClips?.deletes.deleteMetaDataBy_TID_SID(
        table_id,
        contentId
      );
    }
  };

  deleteTableDocumentInstance = async (
    table_id: string,
    contentType: StaticContentTypes,
    contentId: string,
    instanceId: string
  ) => {
    if (contentType === "image") {
      return await this.tableImages?.deletes.deleteInstanceBy_TID_IID_IIID(
        table_id,
        contentId,
        instanceId
      );
    } else if (contentType === "svg") {
      return await this.tableSvgs?.deletes.deleteInstanceBy_TID_SID_SIID(
        table_id,
        contentId,
        instanceId
      );
    } else if (contentType === "video") {
      return await this.tableVideos?.deletes.deleteInstanceBy_TID_VID_VIID(
        table_id,
        contentId,
        instanceId
      );
    } else if (contentType === "application") {
      return await this.tableApplications?.deletes.deleteInstanceBy_TID_AID_AIID(
        table_id,
        contentId,
        instanceId
      );
    } else if (contentType === "text") {
      return await this.tableText?.deletes.deleteInstanceBy_TID_XID_XIID(
        table_id,
        contentId,
        instanceId
      );
    } else if (contentType === "soundClip") {
      return await this.tableSoundClips?.deletes.deleteInstanceBy_TID_SID_SIID(
        table_id,
        contentId,
        instanceId
      );
    }
  };

  deleteUserDocument = async (
    user_id: string,
    contentType: StaticContentTypes,
    contentId: string
  ) => {
    if (contentType === "image") {
      await this.userImages?.deletes.deleteMetaDataBy_UID_IID(
        user_id,
        contentId
      );
    } else if (contentType === "video") {
      await this.userVideos?.deletes.deleteMetaDataBy_UID_VID(
        user_id,
        contentId
      );
    } else if (contentType === "application") {
      await this.userApplications?.deletes.deleteMetaDataBy_UID_AID(
        user_id,
        contentId
      );
    } else if (contentType === "text") {
      await this.userText?.deletes.deleteMetaDataBy_UID_XID(user_id, contentId);
    } else if (contentType === "soundClip") {
      await this.userSoundClips?.deletes.deleteMetaDataBy_UID_AID(
        user_id,
        contentId
      );
    } else if (contentType === "svg") {
      await this.userSvgs?.deletes.deleteMetaDataBy_UID_SID(user_id, contentId);
    }
  };

  onUpdateContentPositioning = async (
    event: onUpdateContentPositioningType
  ) => {
    const { table_id, contentType, contentId, instanceId } = event.header;
    const { positioning } = event.data;

    switch (contentType) {
      case "image":
        this.tableImages?.uploads.editMetaData(
          { table_id, imageId: contentId },
          {
            instances: [
              {
                iiid: instanceId,
                positioning,
              },
            ],
          }
        );
        break;
      case "svg":
        this.tableSvgs?.uploads.editMetaData(
          { table_id, svgId: contentId },
          {
            instances: [
              {
                siid: instanceId,
                positioning,
              },
            ],
          }
        );
        break;
      case "video":
        this.tableVideos?.uploads.editMetaData(
          { table_id, videoId: contentId },
          {
            instances: [
              {
                viid: instanceId,
                positioning,
              },
            ],
          }
        );
        break;
      case "text":
        this.tableText?.uploads.editMetaData(
          { table_id, textId: contentId },
          {
            instances: [
              {
                xiid: instanceId,
                positioning,
              },
            ],
          }
        );
        break;
      case "soundClip":
        this.tableSoundClips?.uploads.editMetaData(
          { table_id, soundClipId: contentId },
          {
            instances: [
              {
                siid: instanceId,
                positioning,
              },
            ],
          }
        );
        break;
      case "application":
        this.tableApplications?.uploads.editMetaData(
          { table_id, applicationId: contentId },
          {
            instances: [
              {
                aiid: instanceId,
                positioning,
              },
            ],
          }
        );
        break;
      default:
        break;
    }
  };

  onUpdateContentEffects = async (event: onUpdateContentEffectsType) => {
    const { table_id, contentType, contentId, instanceId } = event.header;
    const { effects, effectStyles } = event.data;

    switch (contentType) {
      case "image":
        this.tableImages?.uploads.editMetaData(
          { table_id, imageId: contentId },
          {
            instances: [
              {
                iiid: instanceId,
                effects,
                effectStyles: effectStyles as ImageEffectStylesType,
              },
            ],
          }
        );
        break;
      case "video":
        this.tableVideos?.uploads.editMetaData(
          { table_id, videoId: contentId },
          {
            instances: [
              {
                viid: instanceId,
                effects,
                effectStyles: effectStyles as VideoEffectStylesType,
              },
            ],
          }
        );
        break;
      case "text":
        break;
      case "soundClip":
        this.tableSoundClips?.uploads.editMetaData(
          { table_id, soundClipId: contentId },
          {
            instances: [
              {
                siid: instanceId,
                effects,
              },
            ],
          }
        );
        break;
      case "application":
        this.tableApplications?.uploads.editMetaData(
          { table_id, applicationId: contentId },
          {
            instances: [
              {
                aiid: instanceId,
                effects,
                effectStyles: effectStyles as ApplicationEffectStylesType,
              },
            ],
          }
        );
        break;
      case "svg":
        this.tableSvgs?.uploads.editMetaData(
          { table_id, svgId: contentId },
          {
            instances: [
              {
                siid: instanceId,
                effects,
                effectStyles: effectStyles as SvgEffectStylesType,
              },
            ],
          }
        );
        break;
      default:
        break;
    }
  };

  onUpdateVideoPosition = async (event: onUpdateVideoPositionType) => {
    const { table_id, contentId, instanceId } = event.header;

    this.tableVideos?.uploads.editMetaData(
      { table_id, videoId: contentId },
      {
        instances: [
          {
            viid: instanceId,
            videoPosition: event.data.videoPosition,
          },
        ],
      }
    );
  };

  onChangeContentState = async (event: onChangeContentStateType) => {
    const { table_id, contentType, contentId } = event.header;
    const { state } = event.data;

    switch (contentType) {
      case "image":
        this.tableImages?.uploads.editMetaData(
          { table_id, imageId: contentId },
          { state }
        );
        break;
      case "video":
        this.tableVideos?.uploads.editMetaData(
          { table_id, videoId: contentId },
          { state }
        );
        break;
      case "text":
        break;
      case "soundClip":
        this.tableSoundClips?.uploads.editMetaData(
          { table_id, soundClipId: contentId },
          { state }
        );
        break;
      case "application":
        this.tableApplications?.uploads.editMetaData(
          { table_id, applicationId: contentId },
          { state }
        );
        break;
      case "svg":
        this.tableSvgs?.uploads.editMetaData(
          { table_id, svgId: contentId },
          { state }
        );
        break;
      default:
        break;
    }
  };
}

export default TableTopMongo;
