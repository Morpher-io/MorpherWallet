export type Maybe<T> = T | null;


export type TypeEncryptedSeed = {
  __typename?: "TypeEncryptedSeed";
  ciphertext?: Maybe<string>;
  iv?: Maybe<string>;
  salt?: Maybe<string>;
};

export type Type2FARequired = {
  __typename?: "Type2FARequired";
  email: Maybe<boolean>;
  authenticator: Maybe<boolean>;
};

export type TypeSeedFoundData = {
  __typename?: "TypeSeedFoundData";
  email: string;
  encryptedSeed: string;
  hashedPassword: string;
};

export type TypeSeedCreatedData = {
  __typename?: "TypeSeedCreatedData";
  email: string;
  encryptedSeed: string;
  hashedPassword: string;
  unencryptedKeystore: any;
};

export type TypeFetchUser = {
  __typename?: "TypeFetchUser";
  email: string;
  password: string;
};

export type TypeUnlock2fa = {
  __typename?: "TypeUnlock2fa";
  email2FA: string;
  authenticator2FA: string;
};

export type TypeState = {
  __typename?: "TypeState";
	loading: boolean;
	status: string;
	message: string;
	email: string;
	hashedPassword: string;
	encryptedSeed: string;
	encryptedWallet: string;
	keystore: any;
	token: string;
	twoFaRequired: Type2FARequired;
};
