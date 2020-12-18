# Unit Tests
All functions in the backend controllers are tested with rigorous unit tests which you can find in the `tests` folder in the `backend-node` directory.

# Running tests
You will need Node.js and Npm installed to run the backend unit tests. 

You can either use Docker, or a local/cloud machine with a Node.js installation. This guide assumes you have already deployed the database and backend according to the instructions in the repository readme file.

##### Testing using Docker

* Run `docker ps` to get the Docker `CONTAINER ID` under image `morpher/backend-node`.
 
* Run `docker exec -it CONTAINER ID /bin/bash` to get inside the docker container. Replace the `CONTAINER ID` with the value retrieved above.

* Run `npm run test` to run the whole test suite.

##### Testing using Node.js

* `cd` into the `backend-node` directory.
* Run `npm run test` to run the whole test suite.

# More information

You can take a look inside the two main files `validation.test.ts` and `wallet.test.ts` in the `test` folder to find more information about what asserts are being made and the appropriate descriptions and comments. 