# Logging for the Wallet

There are two separate logging mechanisms built into the wallet.

1. Audit logs, which have unlimited retention
2. User Interaction logs, which have limited retention.

## Audit Logs

We are aware that operating a wallet on behalf of users, even without having access to the underlying keystore, is bound to a lot of responsibility. A keystore can eventually control very large sums of funds. If there are user-errors or malfunctions during updating, e.g. user email addresses etc, a user can easily lose his keys forever. To circumvent this, we build an audit log, so that we can track users actions and eventually help users in case of malfunctions, user errors or other problems. This is done via a database-table called "Userhistory" which logs only the most profound changes on user data, for example changing the mail address.

## User Interaction Log

To understand users better, we log almost any action to cloudwatch. This can be fetching a wallet, validating email/password or validating 2fa codes. The cloudwatch logs have a limited retention, no sensitive information like unencrypted keys or passwords, and should only help understand any user-errors or malfunctions better.
