<template>
  <div class="control is-expanded">
    <button type="button" class="button  is-fullwidth" @click="doLogin">
      VKontakte
    </button>
  </div>
</template>
<script>
import { sha256 } from "../utils/cryptoFunctions";

import {
  changePasswordEncryptedSeed,
  recoverVKSeed,
  saveWalletEmailPassword
} from "../utils/backupRestore";

export default {
  name: "VKRecoverWallet",
  components: {},
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
    vkPopup: function(options) {
      const screenX =
          typeof window.screenX != "undefined"
            ? window.screenX
            : window.screenLeft,
        screenY =
          typeof window.screenY != "undefined"
            ? window.screenY
            : window.screenTop,
        outerWidth =
          typeof window.outerWidth != "undefined"
            ? window.outerWidth
            : document.body.clientWidth,
        outerHeight =
          typeof window.outerHeight != "undefined"
            ? window.outerHeight
            : document.body.clientHeight - 22,
        width = options.width,
        height = options.height,
        left = parseInt(screenX + (outerWidth - width) / 2, 10),
        top = parseInt(screenY + (outerHeight - height) / 2.5, 10),
        features =
          "width=" +
          width +
          ",height=" +
          height +
          ",left=" +
          left +
          ",top=" +
          top;
      return window.open(options.url, "vk_oauth", features);
    },

    doLogin() {
      const redirectUri = "http://localhost:3001";
      const uriRegex = new RegExp(redirectUri);
      const url =
        "http://oauth.vk.com/authorize?client_id=7548057&display=popup&v=5.120&response_type=token&scope=offline&redirect_uri=" +
        redirectUri;
      const win = this.vkPopup({
        width: 620,
        height: 370,
        url: url
      });

      const watchTimer = setInterval(async function() {
        try {
          console.log(win.location.href);
          if (uriRegex.test(win.location)) {
            clearInterval(watchTimer);

            const hash = win.location.hash.substr(1);
            const params = hash.split("&").reduce(function(result, item) {
              const parts = item.split("=");
              result[parts[0]] = parts[1];
              return result;
            }, {});
            //console.log(params)
            //console.log("Access token: " + params.access_token)
            //console.log("UserID: " + params.user_id)
            setTimeout(function() {
              win.close();
              //document.location.reload();
            }, 500);

            try {
              const encryptedSeedVK = await recoverVKSeed(
                params.access_token,
                this.walletEmail
              );

              let newPasswordForLocalStorage = prompt(
                "Enter a new password for you local vault",
                "Super Strong Pass0wrd!"
              );
              //double hashing the password
              newPasswordForLocalStorage = await sha256(
                newPasswordForLocalStorage
              );
              const encryptedSeedPassword = await changePasswordEncryptedSeed(
                encryptedSeedVK,
                params.user_id,
                newPasswordForLocalStorage
              );
              saveWalletEmailPassword(this.walletEmail, encryptedSeedPassword);
              window.localStorage.setItem(
                "encryptedSeed",
                JSON.stringify(encryptedSeedPassword)
              );
              window.sessionStorage.setItem(
                "password",
                newPasswordForLocalStorage
              );
            } catch (e) {
              alert(
                "Your account wasn't found with VK recovery, create one with username and password first"
              );
            }
          }
        } catch (e) {
          console.log(e);
        }
      }, 100);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
