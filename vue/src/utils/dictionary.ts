import { i18n } from '@/plugins/i18n';

const getDictionaryValue = (key: string): string => {
	if (!key) return i18n.t('errors.FALLBACK_MESSAGE').toString();

	let message: string = i18n.t('errors.' + key).toString();

	if (!message) {
		message = i18n.t('errors.FALLBACK_MESSAGE').toString();
	}

	return message;
};

export { getDictionaryValue };
