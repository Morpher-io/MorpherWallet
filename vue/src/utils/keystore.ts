import type { TypeCreatedKeystore, TypeEncryptedSeed } from '@/types/global-types'

import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts'

import { cryptoDecrypt, cryptoEncrypt } from '@/utils/cryptoFunctions'

export function getKeystore(
  password: string,
  encryptedSeedObject: TypeEncryptedSeed,
  accountIndex: number
): Promise<TypeCreatedKeystore> {
  return new Promise(async (resolve, reject) => {
    try {
      let mnemonic: string
      if (
        encryptedSeedObject.ciphertext == undefined ||
        encryptedSeedObject.iv == undefined ||
        encryptedSeedObject.salt == undefined
      ) {
        mnemonic = generateMnemonic(english)

        encryptedSeedObject = await cryptoEncrypt(password, mnemonic)
      } else {
        //const encryptedSeedObject = JSON.parse(encryptedSeedPhrase);

        mnemonic = await cryptoDecrypt(
          password,
          encryptedSeedObject.ciphertext,
          encryptedSeedObject.iv,
          encryptedSeedObject.salt
        )
      }

      if (accountIndex == undefined) {
        accountIndex = 1
      }

      const viemAccount = mnemonicToAccount(mnemonic, {
        accountIndex: 0,
        addressIndex: accountIndex || 1
      })

      resolve({ encryptedSeed: encryptedSeedObject, keystore: viemAccount })
    } catch (err) {
      reject(err)
    }
  })
}
