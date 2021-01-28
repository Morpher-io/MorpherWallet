# Frontend Tests
The frontend is tested running the Cypress framework https://www.cypress.io/ as a fast and granual testing method for anything that runs in a browser.

# Running tests
You will need Node.js and Npm installed to run the backend. 

You can either use Docker, or a local/cloud machine with a Node.js installation. This guide assumes you have already deployed the database and backend according to the instructions in the repository readme file.

## Setup

Before you run the tests, input the testing emails in the ``vue/cypress.json`` file. These are the emails used to create your account and test the change email functionality.

You can use any free email service i.e. https://temp-mail.org/en/.

Note: Sending real emails is disabled in development and testing.

## Cypress

Once all the setup is done, you will only need to run `npm run test:e2e` and the Cypress test suite will start. You can either run all of the tests at once or one by one.

# More information

You can take a look inside the test files in the ``vue/tests/e2e/specs`` folder to find more information about what asserts are being made and the appropriate descriptions and comments. 