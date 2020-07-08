import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import getKeystore from "./getKeystore";
import config from "./config.json";
import FacebookLogin from "react-facebook-login";
import "./App.css";

const { cryptoEncrypt, cryptoDecrypt, sha256 } = require("./cryptoFunctions");
//import cryptoDecrypt from "./cryptoDecrypt";

class App extends Component {
  state = {
    walletEmail: "",
    walletPassword: "",
    isAuthenticated: false,
    user: null,
    token: "",
    web3: null,
    accounts: null,
    hasWallet: false,
    hasWalletRecovery: false,
  };

  async componentDidMount() {
    let encryptedKeystore = localStorage.getItem("encryptedSeed") || "";
    if (encryptedKeystore !== "") {
      this.setState({ hasWallet: true });
      //const web3 = await getWeb3(false);
    }
  }

  startWeb3Init = async (user_id, app_id) => {
    try {
      const web3 = await getWeb3(false, user_id + "" + app_id);
      console.log(web3);
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      this.setState({ web3, accounts });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  unlockWallet = async (e) => {
    e.preventDefault();
    let encryptedKeystore = localStorage.getItem("encryptedSeed") || "";
    let email = localStorage.getItem("email") || "";
    if (encryptedKeystore === "") {
      this.setState({ hasWallet: false });
    }

    encryptedKeystore = JSON.parse(encryptedKeystore);
    let seed = await cryptoDecrypt(
      this.state.walletPassword,
      encryptedKeystore.ciphertext,
      encryptedKeystore.iv,
      encryptedKeystore.salt
    );
    let keystore = await getKeystore(this.state.walletPassword, seed);
    let web3 = await getWeb3(false, keystore);
    let accounts = await web3.eth.getAccounts();
    this.setState({
      hasWallet: true,
      unlockedWallet: true,
      web3,
      accounts,
      walletEmail: email,
    });
  };

  createWallet = async (e) => {
    //console.log(e);
    e.preventDefault();

    /**
     * First try to fetch the wallet from the server, in case the browser-cache was cleared
     */
    let key = await sha256(this.state.walletPassword + this.state.walletEmail);
    let options = {
      method: "POST",
      body: JSON.stringify({ key: key }),
      mode: "cors",
      cache: "default",
    };
    let seed = false;
    let response = await fetch(
      config.BACKEND_ENDPOINT + "/index.php?endpoint=restoreEmailPassword",
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
      seed = await cryptoDecrypt(
        this.state.walletPassword,
        encryptedSeedObject.ciphertext,
        encryptedSeedObject.iv,
        encryptedSeedObject.salt
      );
    }

    /**
     * If no wallet was found, then create a new one (seed = false) otherwise use the decrypted seed from above
     */
    let keystore = await getKeystore(this.state.walletPassword, seed);
    let web3 = await getWeb3(false, keystore);
    let accounts = await web3.eth.getAccounts();
    let pwDerivedKey = await new Promise((resolve, reject) => {
      keystore.keyFromPassword(this.state.walletPassword, (err, key) => {
        if (err) {
          reject(err);
        }
        resolve(key);
      });
    });

    seed = keystore.getSeed(pwDerivedKey);
    let encryptedSeed = await cryptoEncrypt(this.state.walletPassword, seed);
    window.localStorage.setItem("encryptedSeed", JSON.stringify(encryptedSeed));
    window.localStorage.setItem("email", this.state.walletEmail);

    options = {
      method: "POST",
      body: JSON.stringify({
        key: key,
        seed: encryptedSeed,
        email: this.state.walletEmail,
      }),
      mode: "cors",
      cache: "default",
    };
    fetch(
      config.BACKEND_ENDPOINT + "/index.php?endpoint=saveEmailPassword",
      options
    ).then((result) => {
      console.log(result);
      result.json().then((response) => {
        console.log(response);
        this.setState({
          hasWallet: true,
          unlockedWallet: true,
          web3,
          accounts,
        });
      });
    });
  };

  logout = () => {
    localStorage.clear();
    this.setState({ isAuthenticated: false, token: "", user: null, web3: null, hasWallet:false });
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
          let keystore = await getKeystore(this.state.walletPassword, seed);
          let web3 = await getWeb3(false, keystore);
          let accounts = await web3.eth.getAccounts();

          //we cannot store the wallet in localstore, because the password needs to come from facebook again anyways, unless we add the following todo:
          /**
           * @todo: add in a step to reset the password, if necessary
           */
          // let pwDerivedKey = await new Promise((resolve, reject) => {
          //   keystore.keyFromPassword(this.state.walletPassword, (err, key) => {
          //     if (err) {
          //       reject(err);
          //     }
          //     resolve(key);
          //   });
          // });

          // seed = keystore.getSeed(pwDerivedKey);
          // let encryptedSeed = await cryptoEncrypt(this.state.walletPassword, seed);
          // window.localStorage.setItem(
          //   "encryptedSeed",
          //   JSON.stringify(encryptedSeed)
          // );
          window.localStorage.setItem("email", response.email);
          this.setState({
            hasWalletRecovery: true,
            hasWallet: true,
            unlockedWallet: true,
            walletEmail: response.email,
            web3,
            accounts,
          });
        } else {
          alert("Your account wasn't found with Facebook recovery, create one with username and password first");
        }
      });
    });
  };

  onFailure = (error) => {
    alert(error);
  };

  sendEther = async (amount, to) => {
    const { web3, accounts } = this.state;
    let result = await web3.eth.sendTransaction({
      from: accounts[0],
      to,
      value: amount * 1000000000000000000,
    });
    console.log(result);
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
        <br />
        <FacebookLogin
          appId={config.FACEBOOK_APP_ID}
          autoLoad={false}
          fields="name,email"
          callback={this.facebookRecovery}
        />
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
        <br />
        <FacebookLogin
          appId={config.FACEBOOK_APP_ID}
          autoLoad={false}
          fields="name,email"
          callback={this.facebookRecovery}
        />
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
