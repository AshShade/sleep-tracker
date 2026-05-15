import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import zh from './zh.json'

const savedLang = import.meta.env.DEV && window.location.pathname.match(/\/(en|zh)/)
  ? window.location.pathname.match(/\/(en|zh)/)![1]
  : undefined

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, zh: { translation: zh } },
  lng: savedLang || (navigator.language.startsWith('zh') ? 'zh' : 'en'),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
