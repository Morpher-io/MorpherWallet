<template>
  <div class="control is-expanded">
    <GoogleLogin
      type="button"
      class="button is-fullwidth"
      :params="{
        client_id:
          '376509986959-k6tstmq30f4spbp9vd1u94tvt8dg714b.apps.googleusercontent.com'
      }"
      :onSuccess="onLogin"
      >Google</GoogleLogin
    >
  </div>
</template>

<script>
import { sha256 } from "../utils/cryptoFunctions";
import {
  recoverGoogleSeed,
  changePasswordEncryptedSeed,
  saveWalletEmailPassword
} from "../utils/backupRestore";
import GoogleLogin from "vue-google-login";

export default {
  name: "GoogleRecoverWallet",
  components: {
    GoogleLogin
  },
  data: function() {
    return {
      isLogined: false
    };
  },
  props: {
    walletEmail: {
      type: String,
      default: ""
    }
  },
  methods: {
    async onLogin(data) {
      try {
        const userID = data.Da;
        const accessToken = data.wc.access_token;
        const encryptedSeedFacebook = await recoverGoogleSeed(
          accessToken,
          this.walletEmail
        );
        let newPasswordForLocalStorage = prompt(
          "Enter a new password for you local vault",
          "Super Strong Pass0wrd!"
        );
        //double hashing the password
        newPasswordForLocalStorage = await sha256(newPasswordForLocalStorage);
        const encryptedSeedPassword = await changePasswordEncryptedSeed(
          encryptedSeedFacebook,
          userID,
          newPasswordForLocalStorage
        );
        saveWalletEmailPassword(this.walletEmail, encryptedSeedPassword);
        window.localStorage.setItem(
          "encryptedSeed",
          JSON.stringify(encryptedSeedPassword)
        );
        window.sessionStorage.setItem("password", newPasswordForLocalStorage);
      } catch (e) {
        alert(
          "Your account wasn't found with Google recovery, create one with username and password first"
        );
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
