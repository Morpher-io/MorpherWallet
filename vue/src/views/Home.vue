<template>
  <div>
    <div v-if="hasWallet == false">
      <h1>Signup/Login to your wallet</h1>
      <form v-on:submit.prevent="createWallet">
        <input
                type="text"
                name="walletEmail"
                placeholder="example@example.com"
                v-model="walletEmail"
        />
        <input
                type="password"
                name="walletPassword"
                placeholder="Strong Password"
                v-model="walletPassword"
        />
        <button>Login / Create new Wallet</button>
      </form>
      <br />
    </div>
    <div v-if="unlockedWallet == false && hasWallet">
      <h1>Unlock your Wallet</h1>
      <form v-on:submit.prevent="unlockWallet()">
        <input
                type="password"
                name="walletPassword"
                placeholder="Strong Password"
                v-model="walletPassword"
        />
        <button>Unlock Wallet</button>
      </form>
      <button @click="cancel">Cancel</button>
      <br />
      <div v-if="loginFailure">
        <br />
        <b>The Password you provided is invalid!</b>
        <br />
        <FBRecoverWallet :walletEmail="walletEmail"></FBRecoverWallet>
        <GoogleRecoverWallet :walletEmail="walletEmail"></GoogleRecoverWallet>
        <VKRecoverWallet :walletEmail="walletEmail"> </VKRecoverWallet>
      </div>
    </div>
    <div v-if="hasWallet && unlockedWallet">
      <h1>Welcome!</h1>
      <h3>You are successfully logged in!</h3>
      <div>
        <p>Your Account: {{accounts[0]}}</p>
        <button @click="logout">
          Log out
        </button>
        <button>
          Close
        </button>
        <button @click="showChangePassword = !showChangePassword">
          Change Password
        </button>
        <button @click="showChangeEmail = !showChangeEmail">
          Change Email
        </button>
        <button @click="showExportWallet = !showExportWallet">
          Backup Wallet
        </button>
      </div>
      <div v-if="showChangePassword">
        <ChangePassword></ChangePassword>
      </div>
      <div v-if="showChangeEmail">
        <ChangeEmail :emailChanged="emailChanged"></ChangeEmail>
      </div>
      <div v-if="showExportWallet">
        <ExportWallet></ExportWallet>
      </div>

      <div>
        <h2>Add Password Recovery</h2>
        <br />
        <FBAddRecovery :walletEmail="walletEmail"></FBAddRecovery>
        <GoogleAddRecovery :walletEmail="walletEmail"></GoogleAddRecovery>
        <VKAddRecovery :walletEmail="walletEmail"> </VKAddRecovery>
      </div>
    </div>
  </div>
</template>


<script>
  import { connectToParent } from "penpal";
  import isIframe from "../utils/isIframe";
  import { getKeystore } from "../utils/keystore";
  const { sha256 } = require("../utils/cryptoFunctions");

  const {
            getEncryptedSeed,
            saveWalletEmailPassword,
            getKeystoreFromEncryptedSeed,
            getEncryptedSeedFromMail,
          } = require("../utils/backupRestore");

  import FBAddRecovery from '../components/FBAddRecovery';
  import FBRecoverWallet from '../components/FBRecoverWallet';
  import GoogleAddRecovery from '../components/GoogleAddRecovery';
  import GoogleRecoverWallet from '../components/GoogleRecoverWallet';
  import VKAddRecovery from '../components/VKAddRecovery';
  import VKRecoverWallet from '../components/VKRecoverWallet';
  import ChangePassword from "../components/ChangePassword"
  import ChangeEmail from "../components/ChangeEmail"
  import ExportWallet from "../components/ExportWallet"

  export default {
    name: 'Wallet',
    components: {
      FBAddRecovery,
      FBRecoverWallet,
      GoogleAddRecovery,
      GoogleRecoverWallet,
      VKAddRecovery,
      VKRecoverWallet,
      ChangePassword,
      ChangeEmail,
      ExportWallet
    },
    data: function(){
      return {
        connection: null,
        walletEmail: "",
        walletPassword: "",
        isAuthenticated: false,
        unlockedWallet: false,
        user: null,
        token: "",
        isLoggedIn: false,
        accounts: [],
        hasWallet: false,
        hasWalletRecovery: false,
        loginFailure: false,
        keystore: null,
        showChangePassword: false,
        showChangeEmail:false,
        showExportWallet: false
      }
    },
    methods: {
      unlockWallet: async function(encryptedSeed, password) {
        try {

          if(!encryptedSeed) encryptedSeed = await getEncryptedSeedFromMail(this.walletEmail)

          if(!password) {
            password = await sha256(this.walletPassword);
            window.sessionStorage.setItem("password", password);
          }


          let keystore = await getKeystoreFromEncryptedSeed(
                  encryptedSeed,
                  password
          );

          let accounts = await keystore.getAddresses();

          this.hasWallet = true;
          this.unlockedWallet = true
          this.keystore = keystore;
          this.accounts = accounts;

          if (isIframe()) {
            //let parent = await this.connection.promise;
            //await parent.onLogin(this.state.accounts[0], this.state.walletEmail)
            (await this.connection.promise).onLogin(
                    this.accounts[0],
                    this.walletEmail
            );
          }
        } catch (e) {
          //console.error(e);
          this.loginFailure = true;
          this.accounts = null;
          this.hasWallet = true;
          this.unlockedWallet = false;
        }
      },
      createWallet: async function (e){
        try {
          //console.log(e);
          e.preventDefault();

          /**
           * First try to fetch the wallet from the server, in case the browser-cache was cleared
           */
          let keystore = null;
          let created = false;
          //double hashed passwords for recovery
          let password = await sha256(this.walletPassword);
          try {
            console.log("trying to find keystore from mail");
            let encryptedSeed = await getEncryptedSeedFromMail(
                    this.walletEmail
            );

            window.localStorage.setItem(
                    "encryptedSeed",
                    JSON.stringify(encryptedSeed)
            );
            window.localStorage.setItem("email", this.walletEmail);
            window.sessionStorage.setItem("password", password);
            console.log("found keystore, trying to unlock");

            return this.unlockWallet(encryptedSeed, password);

          } catch (e) {
            console.log("keystore not found in mail, creating a new one");
            /**
             * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
             */
            keystore = await getKeystore(password);
            created = true;
          }
          let encryptedSeed = await getEncryptedSeed(
                  keystore,
                  password
          );

          window.localStorage.setItem(
                  "encryptedSeed",
                  JSON.stringify(encryptedSeed)
          );
          window.localStorage.setItem("email", this.walletEmail);
          window.sessionStorage.setItem("password", password);

          if (created) {
            saveWalletEmailPassword(this.walletEmail, encryptedSeed);
          }
          let accounts = await keystore.getAddresses();
          this.keystore = keystore;
          this.accounts = accounts;
          this.isLoggedIn = true;
          this.hasWallet = true;
          this.unlockedWallet = true;

          if (isIframe()) {
            //let parent = await this.connection.promise;
            //await parent.onLogin(this.state.accounts[0], this.state.walletEmail)
            (await this.connection.promise).onLogin(
                    this.accounts[0],
                    this.walletEmail
            );
          }
        } catch (e) {
          console.log(e);
        }
      },
      emailChanged: async function(){
        if (isIframe()) {
          //let parent = await this.connection.promise;
          //await parent.onLogin(this.state.accounts[0], this.state.walletEmail)
          (await this.connection.promise).onEmailChange(
                  this.walletEmail
          );
        }
      },
      cancel(){
        localStorage.clear();
        location.reload();
      },
      async logout(){
        if (isIframe()) {
          (await this.connection.promise).onLogout();
        }
        localStorage.clear();
        window.location.reload();
      },
    },
    mounted(){
      let encryptedSeed = localStorage.getItem("encryptedSeed") || "";
      let email = localStorage.getItem("email") || "";
      let password = window.sessionStorage.getItem("password") || "";
      if (encryptedSeed !== "" && email !== "") {
        let loginType = localStorage.getItem("loginType") || "";
        this.loginType =  loginType;
        this.hasWallet = true;
        this.walletEmail = email;

        if (password !== "") {
          this.unlockWallet(JSON.parse(encryptedSeed), password);
        }
      }
      var self = this;
      if (isIframe()) {
        this.connection = connectToParent({
          parentOrigin: "http://localhost:3000",
          // Methods child is exposing to parent
          methods: {
            async getAccounts() {
              if(self.keystore != null) {
                return await self.keystore.getAddresses();
              } else {
                return [];
              }
            },
            async signTransaction(txObj) {
              let signedTx = await new Promise((resolve, reject) => {
                //see if we are logged in?!
                try {
                  self.keystore.signTransaction(txObj, function(err, result) {
                    if(err) {
                      reject(err);
                    }
                    resolve(result);
                  });
                } catch (e) {
                  reject(e);
                }
              });
              console.log(signedTx);
              return signedTx;
            },
            isLoggedIn() {
              //return "ok"
              if (self.unlockedWallet)
                return {
                  isLoggedIn: true,
                  unlockedWallet: self.unlockedWallet,
                  walletEmail: self.walletEmail,
                  accounts: self.accounts,
                };
              else return { isLoggedIn: false };
            },
            logout() {
              //maybe confirm?!
              //call onLogout callback to parent
            },
          },
        });
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h3 {
    margin: 40px 0 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }
</style>
