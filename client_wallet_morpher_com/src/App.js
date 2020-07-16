import React, { Component } from "react";
import getKeystore from "./morpher/keystore";
import config from "./config.json";
import FacebookLogin from "react-facebook-login";
import { connectToParent } from "penpal";
import isIframe from "./morpher/isIframe";

import "./App.css";

const {
  getEncryptedSeed,
  saveWalletEmailPassword,
  restoreKeystoreFromMail,
  getKeystoreFromEncryptedSeed,
  backupFacebookSeed,
  changePasswordEncryptedSeed,
  recoverFacebookSeed,
  getEncryptedSeedFromMail,
} = require("./morpher/backupRestore");

class App extends Component {
  connection;

  state = {
    walletEmail: "",
    walletPassword: "",
    isAuthenticated: false,
    user: null,
    token: "",
    isLoggedIn: false,
    accounts: [],
    hasWallet: false,
    hasWalletRecovery: false,
    loginFailure: false,
    keystore: null,
  };

  async componentDidMount() {
    let encryptedKeystore = localStorage.getItem("encryptedSeed") || "";
    let email = localStorage.getItem("email") || "";
    if (encryptedKeystore !== "" && email !== "") {
      let loginType = localStorage.getItem("loginType") || "";
      this.setState({ loginType });
      this.setState({ hasWallet: true, walletEmail: email });
    }

    if (isIframe()) {
      this.connection = connectToParent({
        parentOrigin: "http://localhost:3000",
        // Methods child is exposing to parent
        methods: {
          getAccounts() {
            return this.keystore.getAccounts();
          },
          signTransaction(txObj) {
            return new Promise((resolve, reject) => {
              //see if we are logged in?!
              try {
                this.keystore.signTransaction(txObj, resolve);
              } catch (e) {
                reject(e);
              }
            });
          },
          isLoggedIn() {
            return this.state.isLoggedIn;
          },
          logout() {
            //maybe confirm?!
            //call onLogout callback to parent
          },
        },
      });
    }
  }

  unlockWallet = async (e) => {
    e.preventDefault();
    let encryptedSeed = localStorage.getItem("encryptedSeed") || "";
    let email = localStorage.getItem("email") || "";
    if (encryptedSeed === "") {
      this.setState({ hasWallet: false });
    }

    encryptedSeed = JSON.parse(encryptedSeed);
    try {
      let keystore = getKeystoreFromEncryptedSeed(
        encryptedSeed,
        this.state.walletPassword
      );
      this.setState({
        hasWallet: true,
        unlockedWallet: true,
        keystore,
        walletEmail: email,
      });
    } catch (e) {
      console.error(e);
      this.setState({ loginFailure: true });
    }
  };

  createWallet = async (e) => {
    //console.log(e);
    e.preventDefault();

    /**
     * First try to fetch the wallet from the server, in case the browser-cache was cleared
     */
    let keystore = null;
    let created = false;
    try {
      console.log("trying to find keystore from mail");
      let encryptedSeed = await getEncryptedSeedFromMail(this.state.walletEmail);
      keystore = await getKeystoreFromEncryptedSeed(encryptedSeed, this.state.walletPassword);
    } catch (e) {
      console.log("keystore not found in mail, creating a new one");
      /**
       * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
       */
      keystore = await getKeystore(this.state.walletPassword);
      created = true;
    }
    let encryptedSeed = await getEncryptedSeed(keystore, this.state.walletPassword);

    window.localStorage.setItem("encryptedSeed", JSON.stringify(encryptedSeed));
    window.localStorage.setItem("email", this.state.walletEmail);
    if (created) {
      saveWalletEmailPassword(this.state.walletEmail, encryptedSeed);
    }
    if(isIframe()) {
      (await this.connection.promise).onLogin(this.state.walletEmail);
    }
    this.setState({ keystore, isLoggedIn: true, hasWallet: true, unlockedWallet: true });
  };

  logout = () => {
    localStorage.clear();
    //this.setState({ isAuthenticated: false, token: "", user: null, web3: null, hasWallet:false });
    window.location.reload();
  };

  facebookResponseAddRecovery = async (response) => {
    let encryptedSeedFromPassword = localStorage.getItem("encryptedSeed") || "";

    if (encryptedSeedFromPassword === "") {
      throw new Error("Keystore not found, aborting");
    }

    let encryptedSeedFromFacebookUserID = await changePasswordEncryptedSeed(
      encryptedSeedFromPassword,
      this.state.walletPassword,
      response.userID
    );
    try {
      await backupFacebookSeed(
        this.state.walletEmail,
        response.userID,
        encryptedSeedFromFacebookUserID
      );
      this.setState({ hasWalletRecovery: true });
    } catch {
      this.setState({ hasWalletRecovery: false });
    }
  };

  facebookRecovery = async (response) => {
    try {
      let encryptedSeedFacebook = await recoverFacebookSeed(
        response.accessToken
      );
      var newPasswordForLocalStorage = prompt(
        "Enter a new password for you local vault",
        "Super Strong Pass0wrd!"
      );
      let encryptedSeedPassword = await changePasswordEncryptedSeed(
        encryptedSeedFacebook,
        response.userID,
        newPasswordForLocalStorage
      );
      let keystore = getKeystoreFromEncryptedSeed(
        encryptedSeedPassword,
        newPasswordForLocalStorage
      );
      saveWalletEmailPassword(this.state.walletEmail, encryptedSeedPassword);
      window.localStorage.setItem("encryptedSeed", encryptedSeedPassword);
      window.localStorage.setItem("email", this.state.walletEmail);
      this.setState({
        hasWalletRecovery: true,
        hasWallet: true,
        unlockedWallet: true,
        keystore,
      });
    } catch (e) {
      alert(
        "Your account wasn't found with Facebook recovery, create one with username and password first"
      );
    }
  };

  onFailure = (error) => {
    alert(error);
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  };

  render() {
    let content = !this.state.hasWallet ? (
      <div>
        <h1>Signup/Login to your wallet</h1>
        <form onSubmit={this.createWallet}>
          <input
            type="text"
            name="walletEmail"
            placeholder="example@example.com"
            value={this.state.walletEmail}
            onChange={this.handleInputChange}
          />
          <input
            type="password"
            name="walletPassword"
            placeholder="Strong Password"
            value={this.state.walletPassword}
            onChange={this.handleInputChange}
          />
          <input type="submit" value="Login / Create new Wallet" />
        </form>
        {this.state.loginFailure ? (
          <div>
            <br />
            <FacebookLogin
              appId={config.FACEBOOK_APP_ID}
              autoLoad={false}
              fields="name,email"
              callback={this.facebookRecovery}
              textButton="Recover your Wallet"
            />
          </div>
        ) : (
          <div></div>
        )}
      </div>
    ) : !this.state.unlockedWallet ? (
      <div>
        <h1>Unlock your Wallet</h1>
        <form onSubmit={this.unlockWallet}>
          <input
            type="password"
            name="walletPassword"
            placeholder="Strong Password"
            value={this.state.walletPassword}
            onChange={this.handleInputChange}
          />
          <input type="submit" value="Unlock Wallet" />
        </form>
        {this.state.loginFailure ? (
          <div>
            <br />
            <FacebookLogin
              appId={config.FACEBOOK_APP_ID}
              autoLoad={false}
              fields="name,email"
              callback={this.facebookRecovery}
              textButton="Recover your Wallet"
            />
          </div>
        ) : (
          <div></div>
        )}
      </div>
    ) : (
      <div>
        <p>Authenticated</p>
        <h1>Hi {this.state.walletEmail}</h1>

        <div>
          <h2>Good to Go!</h2>
          <p>Your Account: {this.state.accounts[0]}</p>
        </div>
        <div>
          <button onClick={this.logout} className="button">
            Log out
          </button>
        </div>
        {!this.state.hasWalletRecovery ? (
          <div>
            <h2>Add Password Recovery</h2>
            <br />
            <FacebookLogin
              appId={config.FACEBOOK_APP_ID}
              autoLoad={false}
              fields="name,email"
              callback={this.facebookResponseAddRecovery}
              textButton="Add Facebook Recovery"
            />
          </div>
        ) : (
          <div></div>
        )}
      </div>
    );
    return <div className="App">{content}</div>;
  }
}

export default App;
