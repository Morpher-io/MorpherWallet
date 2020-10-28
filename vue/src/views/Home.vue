<template>
  <section class="section">
    <div class="container">
      <spinner v-model="showSpinner" v-bind:status="status"></spinner>
      <figure class="image mb-5">
        <img src="/img/morpher-solid.svg" style="max-width: 500px" />
      </figure>
      <signup v-if="!hasWallet && signup" v-on:unlockWallet="unlockWallet"></signup>
      <div v-if="!hasWallet && login">
        <h1 class="title">Signup/Login to your wallet</h1>
        <form v-on:submit.prevent="createWallet">
          <div class="field">
            <label class="label">Email</label>
            <div class="control">
              <input
                type="text"
                name="walletEmail"
                placeholder="example@example.com"
                v-model="walletEmail"
              />
            </div>

            <p class="help">Use this as your Email for Wallet Recovery</p>
          </div>
          <div class="control">
            <input
              type="password"
              name="walletPassword"
              placeholder="Strong Password"
              v-model="walletPassword"
            />
          </div>

          <div class="field is-grouped">
            <div class="control">
              <button class="button is-link">Login / Create Wallet</button>
            </div>
          </div>
        </form>
        <br />
      </div>
      <div v-if="unlockedWallet == false && hasWallet">
        <h1>Welcome Back!</h1>
        <h2>Unlock your Wallet</h2>
        <form v-on:submit.prevent="unlockWalletLoadSeedFromEmail()">
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
          <p>Your Account: {{ accounts[0] }}</p>
          <button @click="logout">Log out</button>
          <button>Close</button>
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
  </section>
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
  validateInput,
} = require("../utils/backupRestore");

import FBAddRecovery from "../components/FBAddRecovery";
import FBRecoverWallet from "../components/FBRecoverWallet";
import GoogleAddRecovery from "../components/GoogleAddRecovery";
import GoogleRecoverWallet from "../components/GoogleRecoverWallet";
import VKAddRecovery from "../components/VKAddRecovery";
import VKRecoverWallet from "../components/VKRecoverWallet";
import ChangePassword from "../components/ChangePassword";
import ChangeEmail from "../components/ChangeEmail";

import ExportWallet from "../components/ExportWallet";

import Spinner from "../components/loading-spinner/Spinner";

import Signup from "../components/Signup";

export default {
  name: "Wallet",
  components: {
    FBAddRecovery,
    FBRecoverWallet,
    GoogleAddRecovery,
    GoogleRecoverWallet,
    VKAddRecovery,
    VKRecoverWallet,
    ChangePassword,
    ChangeEmail,
    ExportWallet,
    Spinner,
    Signup,
  },
  data: function () {
    return {
      connection: null,
      walletEmail: "",
      walletPassword: "",
      walletPasswordRepeat: "",
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
      showChangeEmail: false,
      showExportWallet: false,
      showSpinner: false,
      status: "",
      signup: true,
      login: false,
      invalidEmail: false,
      invalidPassword: false,
    };
  },
  methods: {
    unlockWalletLoadSeedFromEmail: function (password) {
      this.showSpinner = true;
      try {
        getEncryptedSeedFromMail(this.walletEmail).then((seed) => {
          this.unlockedWallet(seed, password);
        });
      } catch (e) {
        console.error(e);
        this.loginFailure = true;
        this.accounts = null;
        this.hasWallet = true;
        this.unlockedWallet = false;
        this.showSpinner = false;
      }
    },
    unlockWallet: function (encryptedSeed, password) {
      this.showSpinner = true;
      this.status = "Unlocking Wallet";
      try {
        if (!encryptedSeed) {
          throw new Error("No Seed given, abort!");
        }

        if (!password) {
          password = sha256(this.walletPassword);
          window.sessionStorage.setItem("password", password);
        }

        let keystore = getKeystoreFromEncryptedSeed(
          encryptedSeed,
          password
        ).then(async (keystore) => {
          let accounts = await keystore.getAddresses();
          this.hasWallet = true;
          this.unlockedWallet = true;
          this.keystore = keystore;
          this.accounts = accounts;

          this.showSpinner = false;

          if (isIframe()) {
            //let parent = await this.connection.promise;
            //await parent.onLogin(this.state.accounts[0], this.state.walletEmail)
            (await this.connection.promise).onLogin(
              this.accounts[0],
              this.walletEmail
            );
          }
        });
      } catch (e) {
        console.error(e);
        this.loginFailure = true;
        this.accounts = null;
        this.hasWallet = true;
        this.unlockedWallet = false;
      }
    },
    emailChanged: async function () {
      if (isIframe()) {
        //let parent = await this.connection.promise;
        //await parent.onLogin(this.state.accounts[0], this.state.walletEmail)
        (await this.connection.promise).onEmailChange(this.walletEmail);
      }
    },
    cancel() {
      localStorage.clear();
      location.reload();
    },
    async logout() {
      if (isIframe()) {
        (await this.connection.promise).onLogout();
      }
      localStorage.clear();
      window.location.reload();
    },
  },
  mounted() {
    let encryptedSeed = localStorage.getItem("encryptedSeed") || "";
    let email = localStorage.getItem("email") || "";
    let password = window.sessionStorage.getItem("password") || "";
    if (encryptedSeed !== "" && email !== "") {
      let loginType = localStorage.getItem("loginType") || "";
      this.loginType = loginType;
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
            if (self.keystore != null) {
              return await self.keystore.getAddresses();
            } else {
              return [];
            }
          },
          async signTransaction(txObj) {
            let signedTx = await new Promise((resolve, reject) => {
              //see if we are logged in?!
              try {
                self.keystore.signTransaction(txObj, function (err, result) {
                  if (err) {
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
  },
};
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
