const FALLBACK_MESSAGE = 'Something went wrong. Please try again later.';

interface Dictionary {
	[key: string]: string;
}

const dictionary: Dictionary = {
	INTERNAL_SERVER_ERROR: 'Internal server error',
	BAD_REQUEST: 'Bad request',
	USER_NOT_FOUND: 'No account found. Please check your credentials and try again.',
	RECOVERY_METHOD_ALREADY_SET: 'Recovery Method already set!',
	RECOVERY_METHOD_NOT_EXIST: 'The Recovery Method does not exist.',
	USER_ALREADY_EXISTS: 'Wallet for this mail already exists.',
	ACCOUNT_NOT_CONFIRMED: 'Account not yet confirmed. Try again.',
	SOME_2FA_WRONG: 'Either Email2FA or Authenticator2FA was wrong. Try again.',
	EMAIL_2FA_WRONG: 'Incorrect Email 2FA code. Check your email and Try again.',
	EMAIL_2FA_EXPIRED: 'Email 2FA is expired. Logout/Login and enter Email 2FA within 15 minutes.',
	METHODS_2FA_NOT_FOUND: '2FA methods could not be found',
	NONCE_NOT_FOUND: 'Nonce could not be found',
	CANNOT_DELETE_USER: 'Could not delete User!',
	CANNOT_GENERATE_QR_CODE: 'Could not generate QR code.',
	CANNOT_VERIFY_AUTHENTICATOR: 'Could not verify authenticator code.',
	PROBLEM_SENDING_EMAIL: 'There was a problem parsing the email',
	CANNOT_VERIFY_EMAIL_CODE: 'Could not verify email code. Please try again.',
	CANNOT_FIND_RECOVERY: 'Could not find recovery!',
	AUTH_ERROR: 'Auth Error - Aborting!',
    // Frontend
    DECRYPT_FAILED: 'Password provided failed to decrypt your account.',
};

const getDictionaryValue = (key: string): string => {
	let message: string = FALLBACK_MESSAGE;

	if (dictionary[key]) {
		message = dictionary[key];
	}

	return message;
};

export { getDictionaryValue };
