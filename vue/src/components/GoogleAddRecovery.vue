<template>
  <div class="control is-expanded">
    <GoogleLogin
    class="button is-fullwidth"
      :params="{
        client_id:
          '376509986959-k6tstmq30f4spbp9vd1u94tvt8dg714b.apps.googleusercontent.com',
      }"
      :onSuccess="onLogin"
      >Google</GoogleLogin
    >
  </div>
</template>


<script>
const {
  backupGoogleSeed,
  changePasswordEncryptedSeed,
} = require("../utils/backupRestore");
import GoogleLogin from "vue-google-login";

export default {
  name: "GoogleAddRecovery",
  components: {
    GoogleLogin,
  },
  data: function () {
    return {
      isLogined: false,
    };
  },
  props: {
    walletEmail: "",
  },
  methods: {
    async onLogin(data) {
      let userID = data.Da;
      let encryptedSeedFromPassword =
        localStorage.getItem("encryptedSeed") || "";
      if (encryptedSeedFromPassword === "") {
        throw new Error("Keystore not found, aborting");
      }

      let encryptedSeedFromFacebookUserID = await changePasswordEncryptedSeed(
        JSON.parse(encryptedSeedFromPassword),
        window.sessionStorage.getItem("password"),
        userID
      );
      try {
        await backupGoogleSeed(
          this.walletEmail,
          userID,
          encryptedSeedFromFacebookUserID
        );
        this.hasWalletRecovery = true;
      } catch (e) {
        console.log(e);
        this.hasWalletRecovery = false;
      }
    },
  },
  mounted() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
