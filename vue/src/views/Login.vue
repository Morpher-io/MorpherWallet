<template>
  <div class="container">
    <spinner v-model="showSpinner" v-bind:status="status"></spinner>

    <h2 class="title">Login</h2>
    <h4 class="subtitle">Unlock your Morpher Wallet</h4>
    <form v-on:submit.prevent="login">
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
              <router-link to="/recovery"
                >Do you want to restore your Account?</router-link
              >
            </p>
          </div>
        </div>
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
          <router-link to="/signup" tag="button" class="button is-light">
            <span class="icon is-small">
              <i class="far fa-file"></i>
            </span>

            <span> Create new Wallet </span>
          </router-link>
        </div>
      </div>
    </form>
    <br />
  </div>
</template>


<script>
import Spinner from "../components/loading-spinner/Spinner";

export default {
  name: "Login",
  components: {
    Spinner,
  },
  data: function () {
    return {
      showSpinner: false,
      status: "",
      walletEmail: "",
      walletPassword: "",
      showRecovery: false,
    };
  },
  methods: {
    login: function () {
      let email = this.walletEmail;
      let password = this.walletPassword;
      this.$store
        .dispatch("fetchUser", { email, password })
        .then((encryptedKeystore) => {
          this.$router.push("/");
        })
        .catch((error) => {
          (err) => console.log(err);
        });
    },
  },
};
</script>

