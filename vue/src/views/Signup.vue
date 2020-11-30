<template>
  <div class="container">
    <spinner v-model="showSpinner" v-bind:status="status"></spinner>

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
            Use a strong Password! It encrypts your Wallet and keeps your Funds
            secure.
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
          <router-link to="/login" tag="button" class="button is-light">
            <span class="icon is-small">
              <i class="fas fa-unlock"></i>
            </span>
            <span> Login instead </span>
          </router-link>
        </div>
      </div>
    </form>
  </div>
</template>


<script>
import Spinner from "../components/loading-spinner/Spinner";
import Password from "vue-password-strength-meter";
import { sha256 } from "../utils/cryptoFunctions";

export default {
  name: "Signup",
  components: {
    Spinner,
    Password,
  },
  data: function () {
    return {
      walletEmail: "",
      walletPassword: "",
      walletPasswordRepeat: "",
      status: "",
      signup: false,
      invalidEmail: false,
      invalidPassword: false,
      showSpinner: false,
    };
  },
  methods: {
    createWallet: async function (e) {
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
      let hashedPassword = sha256(this.walletPassword);
      let email = this.walletEmail;

      this.$store
        .dispatch("createWallet", { email, hashedPassword })
        .then((encryptedKeystore) => {
          this.$router.push("/");
        })
        .catch((error) => {
          (err) => console.log(err);
        });
    },
  },
  mounted() {},
};
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
