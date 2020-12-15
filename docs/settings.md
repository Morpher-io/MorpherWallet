# Wallet Settings
This describes the flow for the settings.

## Middleware
All writing operations for user-settings are bound to a middleware. All requests are signed using the private key of the user as secret and the complete request-payload including a one-time nonce as message content.

:[requestsigning](requestsigning.md)

## Password Change
To change the password, the user has to provide the old password and repeat the new password twice.

The same validation logic as in signup applies to the password change mechanism. It must fulfill:

1. Minimum length
2. Type of characters
3. Combination of upper/lower case

If the validation passes then the users 

1. keystore is decrypted using the old-password. 
2. re-encrypted using the new password
3. the encrypted keystore is sent to the server to replace the old keystore
4. server-side the keystore is encrypted with the server-side keys

## Email Change
Changing the Email Address is a more complex topic than it appears on the surface. 
Pre-assumptions: 

 * The user has successfully unlocked his keystore and has an unlocked wallet in localstorage. 
 * The user might enter a wrong _new_ email address, which needs to be validated. 
 
 Possible attack vector: Someone having access to the users computer might maliciously try to change the users email address.

 :[emailchange](fig_emailchange.plantuml)

 On the first request a 2FA code is generated and sent to the _new_ email address.

 The user is then requested to enter the 2FA code - to validate that he really is the owner of the new email address - and send it along with the payload.

 Note: It is clear that writing a different, un-validated, new email-address potentially _can_ be circumvented on a lower level by grabbing a 2fa code from the first request and change the target email address on the subsequent request. The additional layers are for ux reasons and sanity-checks, rather than bullet-proof security. As soon as the user is in possession of an unencrypted keystore it is to be expected that changing an email address is the least of the problems and the intention of the user.