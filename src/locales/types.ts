import 'i18next';

import type common from './en/common.json';
import type hero from './en/hero.json';
import type wizard from './en/wizard.json';
import type upload from './en/upload.json';
import type results from './en/results.json';
import type faq from './en/faq.json';
import type howto from './en/howto.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      hero: typeof hero;
      wizard: typeof wizard;
      upload: typeof upload;
      results: typeof results;
      faq: typeof faq;
      howto: typeof howto;
    };
  }
}
