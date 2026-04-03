import enCommon from '@locales/en/common.json';
import koCommon from '@locales/ko/common.json';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


void i18n.use(initReactI18next).init({
  lng: 'ko',
  fallbackLng: 'ko',
  interpolation: {
    escapeValue: false
  },
  resources: {
    en: { common: enCommon },
    ko: { common: koCommon }
  },
  defaultNS: 'common'
});

export default i18n;
