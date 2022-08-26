const errorFilter = [
	'User denied account access',
	'User denied transaction',
	'NavigationDuplicated',
	'ACCESS_DENIED',
	'Missing credentials in config',
	'Response not successful: Received status code 400',
	'Network error: Failed to fetch',
	'400 (Bad Request)',
	'Keystore not found',
	'EMAIL_2FA_WRONG',
	'Non-Error promise rejection captured with value: Timeout'
];

/*
 * used to filter out known errors so that they are not logged to sentry
 */
export const checkErrorFilter = (error: string): boolean => {
	const filterErr = errorFilter.find((filter) => error.toLowerCase().includes(filter.toLowerCase()));
	if (filterErr || error.toLowerCase() == 'false' || error.toLowerCase() == 'true') {
		return false;
	} else {
		return true;
	}
};
