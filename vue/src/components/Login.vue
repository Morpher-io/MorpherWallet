<template>
  <div>
    <spinner v-model="showSpinner" v-bind:status="status"></spinner>
    <div class="container">
      <h2 class="title">Login</h2>
      <h4 class="subtitle">Unleash the Blockchain Experience</h4>
      <form v-on:submit.prevent="fetchUser">
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
        </div>

        <div class="field">
          <label class="label">Password</label>

          <div class="control">
            <input
              type="password"
              class="input"
              name="walletPassword"
              placeholder="Strong Password!"
              v-model="walletPassword"
            />

            <div v-if="showRecovery">
              <p class="help is-danger">
                The Password you provided can't be used to de-crypt your wallet.
                Do you want to restore your Account?
              </p>
            </div>
          </div>
        </div>
        <div class="field" v-if="showRecovery">
          <article class="message is-warning">
            <div class="message-header">
              <p>Account Recovery</p>
            </div>
            <div class="message-body">
              <p class="content">
                <strong>Can't remember the password?</strong> We don't know your
                password either, it's <i>that</i> secure. But, if you connected
                any of these social services to your wallet, then try to restore
                your wallet!
              </p>
              <div class="field is-grouped" v-if="showRecovery">
                <FBRecoverWallet :walletEmail="walletEmail"></FBRecoverWallet>
                <GoogleRecoverWallet
                  :walletEmail="walletEmail"
                ></GoogleRecoverWallet>
                <VKRecoverWallet :walletEmail="walletEmail"> </VKRecoverWallet>
              </div>
            </div>
          </article>
        </div>
        <div class="field is-grouped">
          <div class="control is-expanded">
            <button class="button is-primary is-fullwidth" type="submit">
              <span class="icon is-small">
                <i class="fas fa-unlock"></i>
              </span>
              <span> Unlock </span>
            </button>
          </div>
          <div class="control">
            <button
              type="button"
              class="button is-light"
              v-on:click="$emit('create-wallet')"
            >
              <span class="icon is-small">
                <i class="far fa-file"></i>
              </span>
              <span> Create new Wallet </span>
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
import FBRecoverWallet from "../components/FBRecoverWallet";
import GoogleRecoverWallet from "../components/GoogleRecoverWallet";

import VKRecoverWallet from "../components/VKRecoverWallet";
const { sha256 } = require("../utils/cryptoFunctions");

import { getKeystore } from "../utils/keystore";
import {getPayload} from "../utils/backupRestore";
const {
  getEncryptedSeed,
  saveWalletEmailPassword,
  getKeystoreFromEncryptedSeed,
  getEncryptedSeedFromMail,
  validateInput,
        send2FAEmail
} = require("../utils/backupRestore");

export default {
  name: "Login",
  components: {
    Spinner,
    FBRecoverWallet,
    GoogleRecoverWallet,
    VKRecoverWallet,
  },
  data: function () {
    return {
      walletEmail: "",
      walletPassword: "",
      showSpinner: false,
      status: "",
    };
  },
  props: {
    showRecovery: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    fetchUser: async function (e) {
      try {
        e.preventDefault();

        this.showSpinner = true;

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

          console.log(encryptedSeed)

          window.localStorage.setItem(
            "encryptedSeed",
            JSON.stringify(encryptedSeed)
          );
          window.localStorage.setItem("email", this.walletEmail);
          window.sessionStorage.setItem("password", password);
          console.log("found keystore, trying to unlock");
          this.status = "Found User, Trying to Unlock Wallet";

          getPayload(this.walletEmail).then(twoFAMethods => {
            let twoFA = false
            if(twoFAMethods.email || twoFAMethods.authenticator) twoFA = true
            if(twoFAMethods.email) {
              send2FAEmail(this.walletEmail)
            }
            this.$emit("update-twofa", twoFAMethods.email, twoFAMethods.authenticator, twoFA);
          })

          this.$emit("unlock-wallet", encryptedSeed, password);
          this.showSpinner = false;
          return; // this.unlockWallet(encryptedSeed, password);
        } catch (e) {
          console.log("keystore not found in mail, creating a new one");
          /**
           * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
           */

          this.status = "The user wasn't found: Signup first!";
          let self = this;
          setTimeout(function () {
            self.showSpinner = false;
            self.$emit("create-wallet");
          }, 1500);
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>

<style scoped>
/deep/ .Password__strength-meter {
  margin: 5px auto !important;
}
</style>