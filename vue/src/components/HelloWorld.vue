<template>
  <div>
    <div v-if="hasWallet == false">
      <h1>Signup/Login to your wallet</h1>
      <form v-on:submit.prevent="createWallet">
        <input
                type="text"
                name="walletEmail"
                placeholder="example@example.com"
                v-model="email"
        />
        <input
                type="password"
                name="walletPassword"
                placeholder="Strong Password"
                v-model="password"
        />
        <button>Login / Create new Wallet</button>
        <v-facebook-login app-id="299132904630133"  @sdk-init="handleSdkInit" @login="facebookRecovery"  v-model="facebook.model" v-if="loginFailure"
        ><span slot="login">RECOVER YOUR WALLET</span>
        </v-facebook-login>
        <GoogleLogin :params="{client_id: '470009991013-3as95ihufnl6upu3jdf1o2m4vucgbbca.apps.googleusercontent.com'}" :onSuccess="onGoogleSuccess">Google Login</GoogleLogin>
      </form>
      <br />
    </div>
    <div v-if="unlockedWallet == false && hasWallet">
      <h1>Unlock your Wallet</h1>
      <form v-on:submit.prevent="unlockWallet">
        <input
                type="password"
                name="walletPassword"
                placeholder="Strong Password"
                v-model="password"
        />
        <button>Unlock Wallet</button>
      </form>
      <button @click="cancel">Cancel</button>
      <br />
    </div>
    <div v-if="hasWallet && unlockedWallet">
      <p>Authenticated</p>
      <h1>Hi  {{email}}</h1>
      <div>Loading Web3, accounts, and contract...</div>
      <div>
        <h2>Good to Go!</h2>
        <p>Your Account: {{accounts[0]}}</p>
        <button>
        SEND TRANSACTION
        </button>
      </div>

      <div>
        <h2>Add Password Recovery</h2>
        <br />
        <v-facebook-login app-id="299132904630133"  @sdk-init="handleSdkInit2" @login="addFacebookRecovery"  v-model="facebook2.model"
        ><span slot="login">ADD FACEBOOK RECOVERY</span>
        </v-facebook-login>
      </div>
      <div>
        <button @click="logout">Log out</button>
      </div>
  </div>
  </div>
</template>


<script>
  const { cryptoEncrypt, cryptoDecrypt, sha256 } = require("../utils/cryptoFunctions");
  import getWeb3 from "../utils/getWeb3";
  import getKeystore from "../utils/getKeystore";
  import VFacebookLogin from 'vue-facebook-login-component'
  import GoogleLogin from 'vue-google-login';



  export default {
  name: 'HelloWorld',
  components: {
    VFacebookLogin,
    GoogleLogin
  },
  data: function(){
    return {
      email: "",
      password: "",
      hasWallet: false,
      unlockedWallet: false,
      web3: null,
      accounts: null,
      user: null,
      token: "",
      hasWalletRecovery: false,
      loginFailure: false,
      isAuthenticated: false,
      facebook: {
        FB: {},
        model: {},
        scope: {}
      },
      facebook2: {
        FB: {},
        model: {},
        scope: {}
      }
    }
  },
  methods: {
    createWallet: async function(){
      //console.log(e);
      /**
       * First try to fetch the wallet from the server, in case the browser-cache was cleared
       */
      console.log(this.email)
      let key = await sha256(this.email);
      console.log(key)
      let options = {
        method: "POST",
        body: JSON.stringify({ key: key }),
        mode: "cors",
        cache: "default",
      };
      let seed = false;
      let response = await fetch("http://localhost:8080/index.php?endpoint=restoreEmailPassword",
              options
      );
      let responseBody = await response.json();

      /**
       * Login /Create Wallet is in one function
       * @todo: Separate Login and Create Wallet into separate functions so that upon failed "login" a recovery can be suggested
       */
      if (responseBody !== false) {
        /**
         * Wallet was found on server, attempting to decrypt with the password
         */
        let encryptedSeedObject = JSON.parse(responseBody);
        try {
          seed = await cryptoDecrypt(
                  this.password,
                  encryptedSeedObject.ciphertext,
                  encryptedSeedObject.iv,
                  encryptedSeedObject.salt
          );
        } catch (e) {
          console.log("login failure!")
          this.loginFailure = true
          console.error(e);
          return;
        }
      }

      /**
       * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
       */
      let keystore = await getKeystore(this.password, seed);
      let web3 = await getWeb3(false, keystore);
      let accounts = await web3.eth.getAccounts();
      this.saveWalletEmailPassword(keystore, this.password, this.password, key, this.email);
      this.hasWallet = true
      this.unlockedWallet = true
      this.web3 = web3
      this.accounts = accounts
    },
    unlockWallet: async function(){
      let encryptedKeystore = localStorage.getItem("encryptedSeed") || "";
      let email = localStorage.getItem("email") || "";
      if (encryptedKeystore === "") {
        this.hasWallet= false
      }

      encryptedKeystore = JSON.parse(encryptedKeystore);
      try {
        let seed = await cryptoDecrypt(
                this.password,
                encryptedKeystore.ciphertext,
                encryptedKeystore.iv,
                encryptedKeystore.salt
        );

        let keystore = await getKeystore(this.password, seed);
        let web3 = await getWeb3(false, keystore);
        let accounts = await web3.eth.getAccounts();
        this.hasWallet = true
        this.unlockedWallet = true
        this.web3 = web3
        this.accounts = accounts
        this.email = email
      } catch (e) {
        console.error(e);
        this.loginFailure = true
      }
    },
    saveWalletEmailPassword:  async function (keystore, passwordDecrypt, passwordEncrypt, key, userEmail) {
      console.log(userEmail);
      let pwDerivedKey = await new Promise((resolve, reject) => {
        keystore.keyFromPassword(passwordDecrypt, (err, key) => {
          if (err) {
            reject(err);
          }
          resolve(key);
        });
      });

      let seed = keystore.getSeed(pwDerivedKey);
      let encryptedSeed = await cryptoEncrypt(passwordEncrypt, seed);
      window.localStorage.setItem("encryptedSeed", JSON.stringify(encryptedSeed));
      window.localStorage.setItem("email", userEmail);

      let options = {
        method: "POST",
        body: JSON.stringify({
          key: key,
          seed: encryptedSeed,
          email: userEmail,
        }),
        mode: "cors",
        cache: "default",
      };
      let result = await fetch("http://localhost:8080/index.php?endpoint=saveEmailPassword",
              options
      );
      console.log(result);
      let response = await result.json();
      console.log(response);
    },
    handleSdkInit({ FB, scope }){
      this.facebook.scope = scope
      this.facebook.FB = FB
    },
    handleSdkInit2({ FB, scope }){
      this.facebook2.scope = scope
      this.facebook2.FB = FB
    },
    onGoogleSuccess(data) {
      console.log(data)
    },
    async facebookRecovery(data) {
      console.log(data.authResponse.accessToken)
      var self = this
      this.facebook.FB.api('/me', {fields: 'id, name, email'}, async function(user){
        console.log(user)
        let key = await sha256("299132904630133" + user.id);

        //console.log("token: " + data.accessToken)
        const options = {
          method: "POST",
          body: JSON.stringify({accessToken: data.authResponse.accessToken, key: key}),
          mode: "cors",
          cache: "default",
        };
       let r = await fetch("http://localhost:8080/index.php?endpoint=restoreFacebook", options)
        console.log(r)
        r.json().then(async (responseBody) => {
          if (responseBody !== false) {
            //initiate recovery
            let encryptedSeed = JSON.parse(responseBody);
            let seed = await cryptoDecrypt(
                    user.id,
                    encryptedSeed.ciphertext,
                    encryptedSeed.iv,
                    encryptedSeed.salt
            );
            var newPasswordForLocalStorage = prompt(
                    "Enter a new password for you local vault",
                    "Super Strong Pass0wrd!"
            );
            let keystore = await getKeystore(newPasswordForLocalStorage, seed);
            let key_recreated = await sha256(this.password);
            let web3 = await getWeb3(false, keystore);
            let accounts = await web3.eth.getAccounts();
            self.saveWalletEmailPassword(
                    keystore,
                    newPasswordForLocalStorage,
                    newPasswordForLocalStorage,
                    key_recreated,
                    self.email
            );

            window.localStorage.setItem("email", self.email);
            self.web3 = web3
            self.accounts = accounts
            self.hasWalletRecovery = true
            self.hasWallet = true
            self.unlockedWallet = true
          } else {
            alert(
                    "Your account wasn't found with Facebook recovery, create one with username and password first"
            );
          }
        });
    })
    },
    addFacebookRecovery: async function(data) {
      var self = this
      this.facebook2.FB.api('/me', {fields: 'id, name, email'}, async function(user){
        console.log(user)
        let encryptedKeystore = localStorage.getItem("encryptedSeed") || "";

        if (encryptedKeystore === "") {
          throw "Keystore not found, aborting";
        }

        encryptedKeystore = JSON.parse(encryptedKeystore);
        console.log(encryptedKeystore)
        console.log(self.password)
        let seed = await cryptoDecrypt(
                self.password,
                encryptedKeystore.ciphertext,
                encryptedKeystore.iv,
                encryptedKeystore.salt
        );
        let encryptedSeed = await cryptoEncrypt(user.id, seed);
        let key = await sha256("299132904630133" + user.id);
        const options = {
          method: "POST",
          body: JSON.stringify({
            accessToken: data.authResponse.accessToken,
            seed: encryptedSeed,
            key: key,
            email: self.email
          }),
          mode: "cors",
          cache: "default",
        };
        console.log(key)
        fetch("http://localhost:8080/index.php?endpoint=saveFacebook", options).then((r) => {
          console.log(r)
          r.json().then((response) => {
            console.log(response);
            self.hasWalletRecovery = true
          });
        });
      })
    },
    cancel(){
      console.log("cancel")
      localStorage.clear();
      this.isAuthenticated= false
      this.token = ""
      this.user = null
      this.web3 = null
      this.hasWallet = false
    },
    logout(){
      console.log("logout")
      localStorage.clear();
      this.isAuthenticated= false
      this.token = ""
      this.user = null
      this.web3 = null
      this.hasWallet = false
      window.location.reload();
    }
  },
  mounted(){
    let encryptedKeystore = localStorage.getItem("encryptedSeed") || "";
    let email = localStorage.getItem("email") || "";
    if (encryptedKeystore !== "" && email !== "") {
      let loginType = localStorage.getItem("loginType") || "";
      this.loginType = loginType
      this.hasWallet= true
      this.email= email
      //const web3 = await getWeb3(false);
    }
  }
}
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
