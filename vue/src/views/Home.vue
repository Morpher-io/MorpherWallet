<template>
  <section class="section">
    <div class="container">
      <spinner v-model="showSpinner" v-bind:status="status"></spinner>
      <figure class="image mb-5">
        <img src="/img/morpher-solid.svg" style="max-width: 500px" />
      </figure>
      <signup
        v-if="!hasWallet && signup"
        v-on:unlock-wallet="unlockWallet"
        v-on:login-wallet="signup = false"
      ></signup>
      <login
        v-if="!hasWallet && !signup"
        v-on:unlock-wallet="unlockWallet"
        v-on:create-wallet="signup = true"
        :show-recovery="loginFailure"
      ></login>
      <unlock
        v-if="hasWallet && !unlockedWallet"
        v-on:logout-user="logout"
        :wallet-email="walletEmail"
        v-on:unlock-wallet="unlockedWallet"
        :show-recovery="loginFailure"
      ></unlock>

      <div v-if="hasWallet && unlockedWallet && twoFAEmail" class="container">
        <article class="message is-warning">
          <div class="message-header">
            <p>Please input two FA email code</p>
          </div>
          <div class="message-body">
            <form v-on:submit.prevent="validateEmailCode">
              <input style="margin:10px" type="text" id="email" class="option" v-model="emailCode">
              <label style="margin:10px" class="boxLabel" for="email">Email Code</label>
              <span></span>
              <input type="submit" style="margin: 10px" value="Submit" />
            </form>
          </div>

        </article>

      </div>
      <div v-if="hasWallet && unlockedWallet && twoFAAuthenticator" class="container">
        <article class="message is-warning">
          <div class="message-header">
            <p>Please input two FA Authenticator code</p>
          </div>
          <div class="message-body">
            <form v-on:submit.prevent="validateAuthenticatorCode">
              <input style="margin:10px" type="text" id="authenticator" class="option" v-model="authenticatorCode">
              <label style="margin:10px" class="boxLabel" for="authenticator">Authenticator Code</label>
              <span></span>
              <input type="submit" style="margin: 10px" value="Submit" />
            </form>
          </div>
        </article>

      </div>

      <div v-if="hasWallet && unlockedWallet && twoFA" class="container">
        <div class="field is-grouped">
          <div class="control is-expanded">
            <button class="button is-primary is-fullwidth" v-on:click="logout()">
              Logout
            </button>
          </div>

        </div>
      </div>

      <div v-if="hasWallet && unlockedWallet && !twoFAEmail && !twoFAAuthenticator" class="container">
        <div class="columns is-mobile">
          <div class="column">
            <h4 class="subtitle mb-0">Hello {{ walletEmail }}</h4>
            <p class="content is-small has-text-weight-light">
              Not you? <a v-on:click="logout">Sign Out!</a>
            </p>
          </div>
          <div class="column is-narrow">
            <div
              class="dropdown is-right"
              v-bind:class="{ 'is-active': dropdownIsActive }"
            >
              <div class="dropdown-trigger">
                <figure
                  class="image is-64x64"
                  style="cursor: pointer"
                  v-on:click="dropdownIsActive = !dropdownIsActive"
                  aria-haspopup="true"
                  aria-controls="dropdown-menu"
                >
                  <img
                    class="is-rounded"
                    style="border: 3px solid #00c386"
                    :src="
                      'https://robohash.org/' +
                      accounts[0] +
                      '?gravatar=hashed&set=3'
                    "
                  />
                </figure>
              </div>
              <div class="dropdown-menu" id="dropdown-menu" role="menu">
                <div class="dropdown-content">
                  <div class="dropdown-item">
                    <p>Add Social Recovery</p>
                  </div>
                  <div class="dropdown-item">
                    <FBAddRecovery :walletEmail="walletEmail"></FBAddRecovery>
                  </div>
                  <div class="dropdown-item">
                    <GoogleAddRecovery
                      :walletEmail="walletEmail"
                    ></GoogleAddRecovery>
                  </div>
                  <div class="dropdown-item">
                    <VKAddRecovery :walletEmail="walletEmail"> </VKAddRecovery>
                  </div>
                  <hr class="dropdown-divider" />
                  <div class="dropdown-item">
                    <p>Settings</p>
                  </div>
                  <a
                    href="#"
                    class="dropdown-item"
                    @click="
                      showChangePassword = !showChangePassword;
                      dropdownIsActive = !dropdownIsActive;
                    "
                    >Change Password</a
                  >
                  <a
                    href="#"
                    class="dropdown-item"
                    @click="
                      showChangeEmail = !showChangeEmail;
                      dropdownIsActive = !dropdownIsActive;
                    "
                    >Change Email</a
                  >
                  <a
                          href="#"
                          class="dropdown-item"
                          @click="
                      showChange2FA = !showChange2FA;
                      dropdownIsActive = !dropdownIsActive;
                    "
                  >Change 2FA</a
                  >
                  <a
                    href="#"
                    class="dropdown-item"
                    @click="
                      showExportWallet = !showExportWallet;
                      dropdownIsActive = !dropdownIsActive;
                    "
                    >Export Seed Phrase</a
                  >
                  <hr class="dropdown-divider" />

                  <a
                    href="#"
                    class="dropdown-item"
                    v-on:click="
                      logout();
                      dropdownIsActive = !dropdownIsActive;
                    "
                    >Logout</a
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p>Your Account: {{ accounts[0] }}</p>
        </div>

        <article class="message" v-if="showChangePassword">
          <div class="message-header">
            <p>Change the Password</p>
            <button
              class="delete"
              aria-label="delete"
              v-on:click="showChangePassword = false;"
            ></button>
          </div>
          <div class="message-body">
            <ChangePassword></ChangePassword>
          </div>
        </article>

        
        <article class="message" v-if="showChangeEmail">
          <div class="message-header">
            <p>Change Your Email Address</p>
            <button
              class="delete"
              aria-label="delete"
              v-on:click="showChangeEmail = false;"
            ></button>
          </div>
          <div class="message-body">
             <ChangeEmail :emailChanged="emailChanged"></ChangeEmail>
          </div>
        </article>

        <article class="message" v-if="showChange2FA">
          <div class="message-header">
            <p>Change the 2-Factor-Authentication method</p>
            <button
                    class="delete"
                    aria-label="delete"
                    v-on:click="showChange2FA = false;"
            ></button>
          </div>
          <div class="message-body">
            <Change2FA></Change2FA>
          </div>
        </article>
       
        
        <article class="message" v-if="showExportWallet">
          <div class="message-header">
            <p>Export the Wallet Seed Phrase</p>
            <button
              class="delete"
              aria-label="delete"
              v-on:click="showExportWallet = false;"
            ></button>
          </div>
          <div class="message-body">
             <ExportWallet></ExportWallet>
          </div>
        </article>
        <div class="field is-grouped">
          <div class="control is-expanded">
            <button class="button is-primary is-fullwidth" v-on:click="logout()">
              Logout
            </button>
          </div>
          
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

import GoogleAddRecovery from "../components/GoogleAddRecovery";
import VKAddRecovery from "../components/VKAddRecovery";
import ChangePassword from "../components/ChangePassword";
import ChangeEmail from "../components/ChangeEmail";
import Change2FA from "../components/Change2FA";

import ExportWallet from "../components/ExportWallet";

import Spinner from "../components/loading-spinner/Spinner";

import Signup from "../components/Signup";
import Login from "../components/Login";
import Unlock from "../components/Unlock";
import {getPayload, send2FAEmail} from "../utils/backupRestore";

export default {
  name: "Wallet",
  components: {
    FBAddRecovery,
    GoogleAddRecovery,
    VKAddRecovery,
    ChangePassword,
    ChangeEmail,
    Change2FA,
    ExportWallet,
    Spinner,
    Signup,
    Login,
    Unlock,
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
      showChange2FA: false,
      showExportWallet: false,
      showSpinner: false,
      status: "",
      signup: false,
      invalidEmail: false,
      invalidPassword: false,
      dropdownIsActive: false,
      emailCode: "",
      authenticatorCode: "",
      emailVerificationCode: "",
      authenticatorVerificationCode: "",
      twoFA: false,
      twoFAEmail: false,
      twoFAAuthenticator: false,
      doneLoading: false,
    };
  },
  methods: {
    unlockWallet: function (encryptedSeed, password) {
      this.showSpinner = true;
      this.status = "Unlocking Wallet";
      try {
        if (!encryptedSeed) {
          throw new Error("No Seed given, abort!");
        }

        let email = localStorage.getItem("email") || "";
        if(email && this.walletEmail == "") {
          this.walletEmail = email;
        }

        if (!password) {
          password = sha256(this.walletPassword);
          window.sessionStorage.setItem("password", password);
        }

        let keystore = getKeystoreFromEncryptedSeed(encryptedSeed, password)
          .then(async (keystore) => {
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
          })
          .catch((e) => {
            console.log(e);
            this.showSpinner = false;
            this.loginFailure = true;
            window.sessionStorage.removeItem("password");
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
    validateEmailCode(){
      if(this.emailCode === String(this.emailVerificationCode)){
        this.twoFAEmail = false;
        if(this.twoFAAuthenticator === false){
          this.twoFA = false;
        }
      }
      else alert('Email code is not right')
    },
    validateAuthenticatorCode(){

    },
    async logout() {
      this.showSpinner = true;
      this.status = "Logging out...";
      if (isIframe()) {
        (await this.connection.promise).onLogout();
      }
      localStorage.clear();
      // this.hasWallet = false;
      // this.walletEmail = "";
      // this.signup = false;
      window.location.reload();
      //this.showSpinner = false;
    },
  },
  async created(){

  },
  mounted() {
    let encryptedSeed = localStorage.getItem("encryptedSeed") || "";
    let email = localStorage.getItem("email") || "";

    if(email !== ""){
      getPayload(email).then(twoFAMethods => {
        console.log(twoFAMethods)
        this.twoFAEmail = twoFAMethods.email;
        this.twoFAAuthenticator = twoFAMethods.authenticator;

        if(this.twoFAEmail || this.twoFAAuthenticator) this.twoFA = true

        if(this.twoFAEmail) {
          send2FAEmail(email).then(response => {
            this.emailVerificationCode = response.verificationCode;
          })

        }
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
      })
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
