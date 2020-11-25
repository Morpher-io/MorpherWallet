<template>
  <div>
    <spinner v-model="showSpinner" v-bind:status="status"></spinner>
    <div class="container">
      <h2 class="title">Welcome Back!</h2>
      <h4 class="subtitle">Unleash Your Blockchain Experience, {{walletEmail}}</h4>
      <form v-on:submit.prevent="unlockWalletLoadSeedFromEmail">
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

        <div class="field is-grouped" v-if="showRecovery">
          <FBRecoverWallet :walletEmail="walletEmail"></FBRecoverWallet>
          <GoogleRecoverWallet :walletEmail="walletEmail"></GoogleRecoverWallet>
          <VKRecoverWallet :walletEmail="walletEmail"> </VKRecoverWallet>
        </div>

        <div class="field is-grouped">
          <div class="control is-expanded">
            <button class="button is-primary is-fullwidth" type="submit">
              Unlock
            </button>
          </div>
          <div class="control">
            <button class="button is-light" v-on:click="$emit('create-wallet')">
              Create new Wallet
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
import {getPayload, send2FAEmail} from "../utils/backupRestore";
const {
  getEncryptedSeed,
  saveWalletEmailPassword,
  getKeystoreFromEncryptedSeed,
  getEncryptedSeedFromMail,
  validateInput,
} = require("../utils/backupRestore");

export default {
  name: "Unlock",
  components: {
    Spinner,
    FBRecoverWallet,
    GoogleRecoverWallet,
    VKRecoverWallet,
  },
  data: function () {
    return {
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
    walletEmail: {
      type: String,
      required: true,
    },
  },
  methods: {
    unlockWalletLoadSeedFromEmail: function () {
      this.showSpinner = true;
      this.status = "Fetching User from Database";

      try {
        getEncryptedSeedFromMail(this.walletEmail)
          .then((seed) => {
            this.$emit("unlock-wallet", seed, this.walletPassword);
            this.showSpinner = false;
          })
          .catch((e) => {
            console.log(e);
            this.status = "There was a Problem - logging out completely.";
            let self = this;
            setTimeout(function () {
              self.showSpinner = false;
              self.$emit("logout-user");
            }, 1500);
          });
      } catch (e) {
        console.error(e);
        this.status = "There was a Problem - logging out completely.";
        let self = this;
        setTimeout(function () {
          this.showSpinner = false;
          this.$emit("logout-user");
        }, 1500);
        this.showSpinner = false;
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