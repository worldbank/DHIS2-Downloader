import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// English
import aboutEn from './en/about.json'
import dateEn from './en/date.json'
import deMenuEn from './en/dataElements.json'
import dictEn from './en/dictionary.json'
import loginEn from './en/login.json'
import mainEn from './en/main.json'
import navbarEn from './en/navbar.json'
import paginationEn from './en/pagination.json'

// French
import aboutFr from './fr/about.json'
import dateFr from './fr/date.json'
import deMenuFr from './fr/dataElements.json'
import dictFr from './fr/dictionary.json'
import loginFr from './fr/login.json'
import mainFr from './fr/main.json'
import navbarFr from './fr/navbar.json'
import paginationFr from './fr/pagination.json'

const resources = {
  en: {
    translation: {
      aboutPage: aboutEn,
      mainPage: mainEn,
      login: loginEn,
      dataElementsMenu: deMenuEn,
      dateRange: dateEn,
      navbar: navbarEn,
      dictionary: dictEn,
      pagination: paginationEn
    }
  },
  fr: {
    translation: {
      aboutPage: aboutFr,
      mainPage: mainFr,
      login: loginFr,
      dataElementsMenu: deMenuFr,
      dateRange: dateFr,
      navbar: navbarFr,
      dictionary: dictFr,
      pagination: paginationFr
    }
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  },
  debug: true
})

export default i18n
