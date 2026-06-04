import "react-i18next";
import type common from "@/lib/i18n/resources/en.json";

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
    };
  }
}
