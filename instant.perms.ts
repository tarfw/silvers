// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react-native";

const rules = {
  products: {
    allow: {
      view: "true",
      create: "true",
      delete: "true",
      update: "true",
    },
  },
  favorites: {
    bind: [
      "isOwner",
      "auth.id != null && auth.id == data.userId",
      "isAuthenticated",
      "auth.id != null",
    ],
    allow: {
      view: "isOwner",
      create: "isAuthenticated",
      delete: "isOwner",
      update: "isOwner",
    },
  },
  __esModule: "true",
} satisfies InstantRules;

export default rules;
