import { ContentTypes } from "../../../../../universal/contentTypeConstant";

export type CurrentSettingsType = {
  contentType: ContentTypes;
  instanceId: string;
  visualMediaInfo?: {
    isUser: boolean;
    username: string;
    instance: string;
  };
};
