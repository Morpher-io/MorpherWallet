const errorFilter = [
	'User denied account access',
	'User denied transaction',
	'NavigationDuplicated',
	'ACCESS_DENIED',
	'Missing credentials in config',
	'Response not successful: Received status code 400',
	'Network error: Failed to fetch',
	'400 (Bad Request)'
];

/*
 * used to filter out known errors so that they are not logged to sentry
 */
export const checkErrorFilter = (error: string): boolean => {
	const filterErr = errorFilter.find((filter) => error.toLowerCase().includes(filter.toLowerCase()));
	if (filterErr) {
		return false;
	} else {
		return true;
	}
};
