# Social Recovery Flow
Social recovery is a key component of the Keystore. It has two different components:

1. Add Social Recovery for a Keystore
2. Recover a Keystore through Social Recovery

## Add Social Recovery

The User needs to have an unlocked keystore (logged in). He then can, completely client-side, follow the oAuth flow from several Social Recovery providers (e.g. Google, Facebook or VKonkakte). On the client the unique and never-changing user-id of the user is fetched. The unlocked keystore is encrypted with the user-id and sent to the backend. On the backend it is encrypted with a server side key and stored in the database.

## Recover a Keystore

To recover the keystore, the user needs to login client-side again. The user needs to follow the oAuth flow and login with his credentials to the social platform, which represents the security challenge for keystore retrieval. The client-side retrieved oAuth-Access-Key is sent to the server, together with the users' email address he used for signup. On the server side the access-key is used to queries the user-id which encrypted the keystore. The Access-Key _must be valid_ and the user needs to have a keystore in the database for the user-id which responds to the access-key, then the keystore is decrypted with the server side key, which leaves it encrypted with the user-id. The user-id encrypted keystore is sent to the frontend, where it is decrypted and, simply for UX reasons, the user is required to update his password.