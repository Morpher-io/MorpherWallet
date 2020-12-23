# Frontend Tests
The frontend is tested running the Cypress framework https://www.cypress.io/ as a fast and granual testing method for anything that runs in a browser.

# Running tests
You will need Node.js and Npm installed to run the backend. 

You can either use Docker, or a local/cloud machine with a Node.js installation. This guide assumes you have already deployed the database and backend according to the instructions in the repository readme file.

#### Mailslurp

Before you run the tests, you need to configure Mailslurp https://www.mailslurp.com/ to send the emails needed for the 2FA methods.

Create a new account in Mailslurp, create two new inboxes, input the `API_KEY` in `vue/tests/e2e/support/command.js` and input the new inbox id and email in each of the testing files running under `vue/tests/e2e/specs`.

Note: only the `05-ChangeEmail.js` file will need both of the inboxes and the emails for the switch functionality.

#### Cypress

Once all the setup is done, you will only need to run `npm run test:e2e` and the Cypress test suite will start. You can either run all of the tests at once or one by one. One by one in order is recommend so that you can also check by yourself what the tests are asserting.

# More information

You can take a look inside the test files in the ``vue/tests/e2e/specs`` folder to find more information about what asserts are being made and the appropriate descriptions and comments. 