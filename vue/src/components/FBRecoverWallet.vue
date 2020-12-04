<template>
  <div class="control is-expanded">
    <v-facebook-login
      type="button"
      class="button is-fullwidth"
      app-id="299132904630133"
      @sdk-init="handleSdkInit"
      @login="onLogin"
      v-model="facebook.model"
    >
      <span slot="login">Facebook</span>
    </v-facebook-login>
  </div>
</template>

<script>
import { sha256 } from "../utils/cryptoFunctions";
import {
  recoverFacebookSeed,
  changePasswordEncryptedSeed,
  saveWalletEmailPassword
} from "../utils/backupRestore";
import VFacebookLogin from "vue-facebook-login-component";

export default {
  name: "FBAddRecovery",
  components: {
    VFacebookLogin
  },
  data: function() {
    return {
      isLogined: false,
      facebook: {
        FB: {},
        model: {},
        scope: {}
      }
    };
  },
  props: {
    walletEmail: {
      type: String,
      default: ""
    }
  },
  methods: {
    handleSdkInit({ FB, scope }) {
      this.facebook.scope = scope;
      this.facebook.FB = FB;
    },
    async onLogin(data) {
      try {
        const userID = data.authResponse.userID;
        const fbToken = data.authResponse.accessToken;
        const encryptedSeedFacebook = await recoverFacebookSeed(
          fbToken,
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
        window.localStorage.setItem("email", this.walletEmail);
        window.sessionStorage.setItem("password", newPasswordForLocalStorage);
        //this.loginFromRecovery();
      } catch (e) {
        alert(
          "Your account wasn't found with Facebook recovery, create one with username and password first"
        );
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
