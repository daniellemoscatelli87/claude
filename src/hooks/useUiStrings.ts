import { useLanguage } from '../i18n/LanguageContext';
import { ui } from '../i18n/strings';

export function useUiStrings() {
  const { lang } = useLanguage();
  return ui[lang];
}
