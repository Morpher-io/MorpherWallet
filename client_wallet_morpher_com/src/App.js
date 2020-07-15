import React, { Component } from "react";
import getKeystore from "./morpher/keystore";
import config from "./config.json";
import FacebookLogin from "react-facebook-login";
import { connectToParent } from "penpal";

import "./App.css";
const {
  getEncryptedSeed,
  saveWalletEmailPassword,
  restoreKeystoreFromMail,
} = require("./morpher/backupRestore");
const {
  cryptoEncrypt,
  cryptoDecrypt,
  sha256,
} = require("./morpher/cryptoFunctions");
//import cryptoDecrypt from "./cryptoDecrypt";

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
      },
    });
  }

  unlockWallet = async (e) => {
    e.preventDefault();
    let encryptedKeystore = localStorage.getItem("encryptedSeed") || "";
    let email = localStorage.getItem("email") || "";
    if (encryptedKeystore === "") {
      this.setState({ hasWallet: false });
    }

    encryptedKeystore = JSON.parse(encryptedKeystore);
    try {
      let seed = await cryptoDecrypt(
        this.state.walletPassword,
        encryptedKeystore.ciphertext,
        encryptedKeystore.iv,
        encryptedKeystore.salt
      );

      let keystore = await getKeystore(this.state.walletPassword, seed);

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
      keystore = restoreKeystoreFromMail(
        this.state.walletEmail,
        this.state.walletPassword
      );
    } catch (e) {
      /**
       * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
       */
      keystore = await getKeystore(this.state.walletPassword);
      created = true;
    }
    let encryptedSeed = getEncryptedSeed(keystore, this.state.walletPassword);

    window.localStorage.setItem("encryptedSeed", JSON.stringify(encryptedSeed));
    window.localStorage.setItem("email", this.state.walletEmail);
    if (created) {
      saveWalletEmailPassword(this.state.walletEmail, encryptedSeed);
    }
    this.setState({ keystore, isLoggedIn: true, hasWallet: true });
  };

  logout = () => {
    localStorage.clear();
    //this.setState({ isAuthenticated: false, token: "", user: null, web3: null, hasWallet:false });
    window.location.reload();
  };

  facebookResponseAddRecovery = async (response) => {
    let encryptedKeystore = localStorage.getItem("encryptedSeed") || "";

    if (encryptedKeystore === "") {
      throw "Keystore not found, aborting";
    }

    encryptedKeystore = JSON.parse(encryptedKeystore);
    let seed = await cryptoDecrypt(
      this.state.walletPassword,
      encryptedKeystore.ciphertext,
      encryptedKeystore.iv,
      encryptedKeystore.salt
    );
    let encryptedSeed = await cryptoEncrypt(response.userID, seed);
    let key = await sha256(config.FACEBOOK_APP_ID + response.userID);
    const options = {
      method: "POST",
      body: JSON.stringify({
        accessToken: response.accessToken,
        seed: encryptedSeed,
        key: key,
        email: this.state.walletEmail,
      }),
      mode: "cors",
      cache: "default",
    };
    fetch(
      config.BACKEND_ENDPOINT + "/index.php?endpoint=saveFacebook",
      options
    ).then((r) => {
      r.json().then((response) => {
        console.log(response);
        this.setState({ hasWalletRecovery: true });
      });
    });
  };

  facebookRecovery = async (response) => {
    console.log(response);
    let key = await sha256(config.FACEBOOK_APP_ID + response.userID);
    const options = {
      method: "POST",
      body: JSON.stringify({ accessToken: response.accessToken, key: key }),
      mode: "cors",
      cache: "default",
    };
    fetch(
      config.BACKEND_ENDPOINT + "/index.php?endpoint=restoreFacebook",
      options
    ).then((r) => {
      r.json().then(async (responseBody) => {
        if (responseBody !== false) {
          //initiate recovery
          let encryptedSeed = JSON.parse(responseBody);
          let seed = await cryptoDecrypt(
            response.userID,
            encryptedSeed.ciphertext,
            encryptedSeed.iv,
            encryptedSeed.salt
          );
          var newPasswordForLocalStorage = prompt(
            "Enter a new password for you local vault",
            "Super Strong Pass0wrd!"
          );
          let keystore = await getKeystore(newPasswordForLocalStorage, seed);
          let key_recreated = await sha256(this.state.walletPassword);
          this.saveWalletEmailPassword(
            keystore,
            newPasswordForLocalStorage,
            newPasswordForLocalStorage,
            key_recreated,
            this.state.walletEmail
          );

          window.localStorage.setItem("email", this.state.walletEmail);
          this.setState({
            hasWalletRecovery: true,
            hasWallet: true,
            unlockedWallet: true,
            walletEmail: this.state.walletEmail,
          });
        } else {
          alert(
            "Your account wasn't found with Facebook recovery, create one with username and password first"
          );
        }
      });
    });
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
        {!this.state.web3 ? (
          <div>Loading Web3, accounts, and contract...</div>
        ) : (
          <div>
            <h2>Good to Go!</h2>
            <p>Your Account: {this.state.accounts[0]}</p>
            <button
              onClick={() =>
                this.sendEther(
                  0.1,
                  "0x5AD2d0Ebe451B9bC2550e600f2D2Acd31113053E"
                )
              }
            >
              SEND TRANSACTION
            </button>
          </div>
        )}
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
