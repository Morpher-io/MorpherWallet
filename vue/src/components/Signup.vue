<template>
  <div>
    <spinner v-model="showSpinner" v-bind:status="status"></spinner>
    <div class="container">
      <h2 class="title">Signup</h2>
      <h4 class="subtitle">Create a new Wallet</h4>
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

          <p class="help">Use this Email-Address for Wallet Recovery</p>
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
              placeholder="Strong Password!"
              v-model="walletPassword"
            />
            <password
              v-model="walletPassword"
              :strength-meter-only="true"
              :secure-length="8"
              style="max-width: initial; margin-top: -8px"
            />
            <p class="help">
              Use a strong Password! It encrypts your Wallet and keeps your
              Funds secure.
            </p>

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
          <div class="control is-expanded">
            <button class="button is-primary is-fullwidth" type="submit">
              <span class="icon is-small">
                <i class="far fa-file"></i>
              </span>
              <span> Create new Wallet </span>
            </button>
          </div>
          <div class="control">
            <button
              type="button"
              class="button is-light"
              v-on:click="
                $emit('login-wallet');
                return;
              "
            >
              <span class="icon is-small">
                <i class="fas fa-unlock"></i>
              </span>
              <span> Login instead </span>
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
import { sha256 } from "../utils/cryptoFunctions";

import isIframe from "../utils/isIframe";
import { getKeystore } from "../utils/keystore";
import { getPayload } from "../utils/backupRestore";
import {
  getEncryptedSeed,
  saveWalletEmailPassword,
  getKeystoreFromEncryptedSeed,
  getEncryptedSeedFromMail,
  validateInput,
  send2FAEmail
} from "../utils/backupRestore";

export default {
  name: "Singup",
  components: {
    Password,
    Spinner
  },
  data: function() {
    return {
      walletEmail: "",
      walletPassword: "",
      walletPasswordRepeat: "",
      showSpinner: false,
      status: "",
      invalidEmail: false,
      invalidPassword: false,
      onSuccessfulCreate: undefined
    };
  },
  methods: {
    createWallet: async function(e) {
      try {
        //console.log(e);
        e.preventDefault();
        this.invalidEmail = false;
        this.invalidPassword = false;

        if (this.walletPassword != this.walletPasswordRepeat) {
          this.invalidPassword =
            "The passwords are not the identical, please repeat the password";
          return;
        }

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
        const password = await sha256(this.walletPassword);
        this.$emit("update-twofa", true, false, true);
        try {
          console.log("trying to find keystore from mail");
          this.status = "Looking up User from Database";
          const encryptedSeed = await getEncryptedSeedFromMail(
            this.walletEmail
          );

          window.localStorage.setItem(
            "encryptedSeed",
            JSON.stringify(encryptedSeed)
          );
          window.localStorage.setItem("email", this.walletEmail);
          window.sessionStorage.setItem("password", password);
          console.log("found keystore, trying to unlock");
          this.status = "Found User, Trying to Unlock Wallet";
          this.$emit("unlock-wallet", encryptedSeed, password);
          return; // this.unlockWallet(encryptedSeed, password);
        } catch (e) {
          console.log("keystore not found in mail, creating a new one");
          /**
           * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
           */

          this.status = "Creating new Keystore";
          keystore = await getKeystore(password);
          console.log(keystore);
          created = true;
        }
        const encryptedSeed = await getEncryptedSeed(keystore, password);
        console.log(encryptedSeed);

        window.localStorage.setItem(
          "encryptedSeed",
          JSON.stringify(encryptedSeed)
        );
        window.localStorage.setItem("email", this.walletEmail);
        window.sessionStorage.setItem("password", password);

        if (created) {
          await saveWalletEmailPassword(this.walletEmail, encryptedSeed);
          await send2FAEmail(this.walletEmail);
        }
        this.$emit("unlock-wallet", encryptedSeed, password);
        this.showSpinner = false;
      } catch (e) {
        console.log(e);
      }
    }
  }
};
</script>

<style scoped>
.Password__strength-meter {
  margin: 5px auto !important;
}
</style>
