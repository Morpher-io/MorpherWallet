# Login Flow for the Wallet

This section describes the login and unlock-Flow for the wallet.

The login and unlock flow are different only by the contents of the localStorage. If the encryptedSeed is already stored in localStorage, then we don't need to fetch it from the backend.

## Login Flow

:[LoginflowUml](fig_login.plantuml)

When the user logs into the wallet the first time, then the browsers localstore and sessionstore is empty.

1. The user is required to enter Email-Address and Password.

    The password is temporarily stored, because of UX reasons. It is used later in the process.

2. The Wallet checks with the backend if the user already exists. 

    _Sidenote_: It became "good behavior" to show generic error messages to avoid leaking user-exists information. This simply doesn't make sense, because the backend is a data-store for an encrypted wallet. The actual decryption process is done in-browser.

3. Depending on the 2FA settings, the user is then required to enter the 2FA codes. The backend only delivers the wallet when the 2fa codes are correct and onyl the correct password can then decrypt the keystore.

4. If decryption with the password was successful then the _password-encrypted_ keystore (after decrypt with 2fa) is stored in localstorage. This lets the user "unlock" the keystore with the password only in sub-sequent uses of the wallet without re-fetching it from the server.

5. The wallet is initialized: The keystore is used to generate an account. The account is stored in the JavaScript-Storage-Backend. The frontend shows the Address and UI


## Unlock Flow


:[UnlockFlowUML](fig_unlock.plantuml)