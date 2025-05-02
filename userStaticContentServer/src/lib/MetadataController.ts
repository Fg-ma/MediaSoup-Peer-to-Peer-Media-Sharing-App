import { tableTopMongo } from "src";
import { onChangeContentStateType } from "../typeConstant";

class MetadataController {
  constructor() {}

  onChangeContentState = (event: onChangeContentStateType) => {
    tableTopMongo.onChangeUserContentState(event);
  };
}

export default MetadataController;
