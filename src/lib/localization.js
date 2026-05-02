import { $messages } from './messages.js';

export class AppLocalization {
  constructor(locale) {
    this.locale = locale;
    this.messages = $messages[locale] || $messages['en'];
  }

  translate(key) {
    return this.messages[key] || key;
  }
}
