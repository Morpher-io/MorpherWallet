<template>
  <div>
    <form v-on:submit.prevent="formSubmitChangePassword">
      <input
        type="password"
        name="oldPassword"
        placeholder="Old Password"
        v-model="oldPassword"
      />
      <input
        type="password"
        name="newPassword"
        placeholder="New Password"
        v-model="newPassword"
      />
      <input
        type="password"
        name="newPasswordRepeat"
        placeholder="New Password Again"
        v-model="newPasswordRepeat"
      />
      <input type="submit" value="Submit" />
    </form>
  </div>
</template>

<script>
import { sha256 } from "../utils/cryptoFunctions";
import {
  getKeystoreFromEncryptedSeed,
  changePasswordEncryptedSeed,
  saveWalletEmailPassword,
  validateInput
} from "../utils/backupRestore";

export default {
  name: "ChangePassword",
  data: function() {
    return {
      oldPassword: "",
      newPassword: "",
      newPasswordRepeat: ""
    };
  },
  methods: {
    async formSubmitChangePassword(e) {
      e.preventDefault();

      if (this.newPassword === this.newPasswordRepeat) {
        const encryptedSeed = JSON.parse(localStorage.getItem("encryptedSeed"));

        const oldPassword = await sha256(this.oldPassword);
        const newPassword = await sha256(this.newPassword);

        const passwordMessage = await validateInput(
          "password",
          this.newPassword
        );

        if (passwordMessage) alert(passwordMessage);
        else {
          try {
            await getKeystoreFromEncryptedSeed(encryptedSeed, oldPassword);
          } catch (e) {
            alert("Old password is not right.");
          }

          const newEncryptedSeed = await changePasswordEncryptedSeed(
            encryptedSeed,
            oldPassword,
            newPassword
          );

          await saveWalletEmailPassword(
            window.localStorage.getItem("email"),
            newEncryptedSeed
          );

          window.localStorage.setItem(
            "encryptedSeed",
            JSON.stringify(newEncryptedSeed)
          );

          window.sessionStorage.setItem("password", newPassword);

          alert("Password changed successfully.");

          this.oldPassword = "";
          this.newPassword = "";
          this.newPasswordRepeat = "";
        }
      } else alert("New passwords do not match.");
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
