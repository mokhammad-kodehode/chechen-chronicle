import { localeString } from "./objects/localeString";
import { localeText } from "./objects/localeText";
import { blockContent } from "./objects/blockContent";
import { person } from "./documents/person";
import { publication } from "./documents/publication";
import { place } from "./documents/place";
import { archiveItem } from "./documents/archiveItem";

export const schemaTypes = [
  // Objects
  localeString,
  localeText,
  blockContent,

  // Documents
  person,
  publication,
  place,
  archiveItem,
];
