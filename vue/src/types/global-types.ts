import * as zksync from 'zksync';

export type Maybe<T> = T | null;

export type TypeEncryptedSeed = {
	__typename?: 'TypeEncryptedSeed';
	ciphertext?: string;
	iv?: string;
	salt?: string;
};

export type Type2FARequired = {
	__typename?: 'Type2FARequired';
	email: boolean;
	authenticator: boolean;
	authenticatorConfirmed: boolean;
	needConfirmation?: boolean;
	app_lang?: string;
};

export type TypeSeedFoundData = {
	__typename?: 'TypeSeedFoundData';
	email: string;
	encryptedSeed: TypeEncryptedSeed;
	hashedPassword: string;
};

export type TypeSeedCreatedData = {
	__typename?: 'TypeSeedCreatedData';
	email: string;
	encryptedSeed: TypeEncryptedSeed;
	hashedPassword: string;
};

export type TypeFetchUser = {
	__typename?: 'TypeFetchUser';
	email: string;
	password: string;
	recaptchaToken: string;
};

export type TypeUnlock2fa = {
	__typename?: 'TypeUnlock2fa';
	email2FA: string;
	authenticator2FA: string;
	recaptchaToken: string;
};

export type WalletBase = {
	__typename?: 'WalletBase';
	address: string;
	privateKey: string;
	accountId: number | undefined;
	sign: (msg: string)=> Promise<string>;
	transfer: (txObject: TransactionObject)=> Promise<TransactionReceipt>;
	encrypt: (password: string)=> Promise<string>;
	
};

export type TypeState = {
	__typename?: 'TypeState';
	loading: boolean;
	status: string;
	message: string;
	email: string;
	hashedPassword: string;
	encryptedSeed: string;
	encryptedWallet: string;
	keystore: WalletBase;
	token: string;
	twoFaRequired: Type2FARequired;
};

export type TypeUnlockWithPassword = {
	__typename?: 'TypeUnlockWithPassword';
	password: string;
	recaptchaToken: string;
};

export type TypeUpdateRecovery = {
	__typename?: 'TypeUpdateRecovery';
	dbUpdate: boolean;
};

export type TypeChangePassword = {
	__typename?: 'TypeChangePassword';
	oldPassword: string;
	newPassword: string;
};

export type TypeLoadingMessage = {
	__typename?: 'TypeLoadingMessage';
	message: string;
};

export type TypeResetRecovery = {
	__typename?: 'TypeResetRecovery';
	key: string;
	recoveryTypeId: string;
};

export type TypeChangeEmail = {
	__typename?: 'TypeChangePassword';
	password: string;
	newEmail: string;
	twoFa: number;
};

export type TypeUserFoundData = {
	__typename?: 'TypeUserFoundData';
	email: string;
	hashedPassword: string;
};

export type TypePayloadData = {
	__typename?: 'TypePayloadData';
	email: boolean;
	authenticator: boolean;
	authenticatorConfirmed?: boolean;
	needConfirmation?: boolean;
	ip_country?: string;
};

export type Type2FAUpdateParams = {
	__typename?: 'Type2FAUpdateParams';
	email: boolean;
	authenticator: boolean;
	email2faVerification: string;
	authenticator2faVerification: string;
};

export type TypeCreatedKeystore = {
	__typename?: 'TypeCreatedKeystore';
	encryptedSeed: TypeEncryptedSeed;
	keystore: WalletBase;
};

export type WalletSign = {
	__typename?: 'WalletSign';
	sign: any;
};

export type MorpherWalletConfig = {
	__typename?: 'Type2FARequired';
	show_transaction: boolean;
	confirm_transaction: boolean;
	show_message: boolean;
	confirm_message: boolean;
} | null;

export type TransactionObject = {
	to: string,
	token: string;
	amount: number;
	fee: number;
	nonce: number;
	type: string;
}

export type TransactionReceipt = {
	txId: string,
	date: number;
	amount: number;
	fee: number;
	token: string;
	type: string;
	txUrl: string;
}

export type TypeKeystoreUnlocked = {
	__typename?: 'TypeKeystoreUnlocked';
	accounts: [string];
	keystore: WalletBase;
	hashedPassword: string;
};

export type TypeRequestParams = {
	__typename?: 'TypeRequestParams';
	body: any;
	url: string;
	method: string;
};
export type TypeRecoveryParams = {
	__typename?: 'TypeRecoveryParams';
	accessToken: string;
	password: string;
	recoveryTypeId: number;
};
export type TypeAddRecoveryParams = {
	__typename?: 'TypeAddRecoveryParams';
	key: string;
	password: string;
	recoveryTypeId: number;
};

export type TypeUpdateUserPayload = {
	__typename?: 'TypeUpdateUserPayload';
	column: string;
	value: string;
};

export type TypeExportPhraseKeyVariables = {
	__typename?: 'TypeExportPhraseKeyVariables';
	account: string;
	password: string;
};

export type TypeShowPhraseKeyVariables = {
	__typename?: 'TypeShowPhraseKeyVariables';
	password: string;
};

export type TypeUpdatePrivateKey = {
	__typename?: 'TypeUpdatePrivateKey';
	privateKey: string;
};

export type TypeUpdateSeedPhrase = {
	__typename?: 'TypeUpdateSeedPhrase';
	seedPhrase: string;
};
