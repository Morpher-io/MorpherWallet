<template>
  <div>
    <spinner v-model="showSpinner" v-bind:status="status"></spinner>
    <div class="container">
      <h2 class="title">Signup</h2>
      <h4 class="subtitle">Create a new Morpher Wallet</h4>
      <form v-on:submit.prevent="createWallet">
        <div class="field">
          <label class="label">Email</label>
          <div class="control">
            <input
              type="email"
              class="input"
              name="walletEmail"
              placeholder="example@example.com"
              v-model="walletEmail"
            />
          </div>

          <p class="help">Use this as your Email for Wallet Recovery</p>
          <p class="help is-danger" v-if="invalidEmail">
            {{ invalidEmail }}
          </p>
        </div>

        <div class="field">
          <label class="label">Password</label>
          <div class="control">
            <input
              type="password"
              class="input"
              name="walletPassword"
              placeholder="Strong Password"
              v-model="walletPassword"
            />

            <password v-model="walletPassword" :strength-meter-only="true" />
            <p class="help is-danger" v-if="invalidPassword">
              {{ invalidPassword }}
            </p>
          </div>
        </div>
        <div class="field">
          <label class="label">Repeat Password</label>
          <div class="control">
            <input
              type="password"
              class="input"
              name="walletPasswordRepeat"
              placeholder="Repeat Password"
              v-model="walletPasswordRepeat"
            />
          </div>
        </div>

        <div class="field is-grouped">
          <div class="control">
            <button class="button is-link" type="submit">
              Create New Wallet
            </button>
          </div>
          <div class="control">
            <button
              class="button is-link is-light"
              v-on:click="
                signup = false;
                login = true;
              "
            >
              Login Instead
            </button>
          </div>
        </div>
      </form>
      <br />
    </div>
  </div>
</template>
<script>
import Spinner from "../components/loading-spinner/Spinner";
import Password from "vue-password-strength-meter";
const { sha256 } = require("../utils/cryptoFunctions");


import isIframe from "../utils/isIframe";
import { getKeystore } from "../utils/keystore";
const {
  getEncryptedSeed,
  saveWalletEmailPassword,
  getKeystoreFromEncryptedSeed,
  getEncryptedSeedFromMail,
  validateInput,
} = require("../utils/backupRestore");

export default {
  name: "Wallet",
  components: {
      Password,
      Spinner
  },
  data: function () {
    return {
      walletEmail: "",
      walletPassword: "",
      walletPasswordRepeat: "",
      showSpinner: false,
      status: "",
      invalidEmail: false,
      invalidPassword: false,
      onSuccessfulCreate: undefined,
    };
  },
  methods: {
    createWallet: async function (e) {
      try {
        //console.log(e);
        e.preventDefault();
        this.invalidEmail = false;
        this.invalidPassword = false;

        /**
         * Validating Email
         */
        this.showSpinner = true;
        this.status = "Validating Email";
        const emailMessage = await validateInput("email", this.walletEmail);
        if (emailMessage) {
          this.showSpinner = false;
          this.status = "";
          this.invalidEmail = emailMessage;
          return;
        }

        /**
         * Validating Password
         */
        this.status = "Validating Password";
        const passwordMessage = await validateInput(
          "password",
          this.walletPassword
        );

        if (passwordMessage) {
          this.showSpinner = false;
          this.status = "";
          this.invalidPassword = passwordMessage;
          return;
        }

        /**
         * First try to fetch the wallet from the server, in case the browser-cache was cleared
         */
        let keystore = null;
        let created = false;
        //double hashed passwords for recovery
        let password = await sha256(this.walletPassword);
        try {
          console.log("trying to find keystore from mail");
          this.status = "Looking up User from Database";
          let encryptedSeed = await getEncryptedSeedFromMail(this.walletEmail);

          window.localStorage.setItem(
            "encryptedSeed",
            JSON.stringify(encryptedSeed)
          );
          window.localStorage.setItem("email", this.walletEmail);
          window.sessionStorage.setItem("password", password);
          console.log("found keystore, trying to unlock");
          this.status = "Found User, Trying to Unlock Wallet";
          this.$emit("unlockWallet", encryptedSeed, password);
          return; // this.unlockWallet(encryptedSeed, password);
        } catch (e) {
          console.log("keystore not found in mail, creating a new one");
          /**
           * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
           */
          
          this.status = "Creating new Keystore";
          keystore = await getKeystore(password);
          created = true;
        }
        let encryptedSeed = await getEncryptedSeed(keystore, password);

        window.localStorage.setItem(
          "encryptedSeed",
          JSON.stringify(encryptedSeed)
        );
        window.localStorage.setItem("email", this.walletEmail);
        window.sessionStorage.setItem("password", password);

        if (created) {
          saveWalletEmailPassword(this.walletEmail, encryptedSeed);
        }
        this.$emit("unlockWallet", encryptedSeed, password);
        
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>