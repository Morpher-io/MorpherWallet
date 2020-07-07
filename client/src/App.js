import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import getKeystore from "./getKeystore";
import cryptoEncrypt from "./cryptoEncrypt";
import cryptoDecrypt from "./cryptoDecrypt";
import config from "./config.json";
import FacebookLogin from "react-facebook-login";

import "./App.css";

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
    hasWalletRecovery: false
  };

  async componentDidMount() {
    let encryptedKeystore = localStorage.getItem("encryptedSeed") || "";
    if (encryptedKeystore !== "") {
      this.setState({hasWallet: true});
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
    if (encryptedKeystore === "") {
      this.setState({hasWallet: false});
    }

    encryptedKeystore = JSON.parse(encryptedKeystore);
    let seed = await cryptoDecrypt(this.state.walletPassword, encryptedKeystore.ciphertext, encryptedKeystore.iv, encryptedKeystore.salt);
    let keystore = await getKeystore(this.state.walletPassword, seed);
    let web3 = await getWeb3(false, keystore);
    let accounts = await web3.eth.getAccounts();
    this.setState({hasWallet: true, unlockedWallet: true, web3, accounts});
  }

  createWallet = async (e) => {
    //console.log(e);
    e.preventDefault();
    let keystore = await getKeystore(this.state.walletPassword, false);
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
    let seed = keystore.getSeed(pwDerivedKey);
    console.log(seed);
    let encryptedSeed = await cryptoEncrypt(this.state.walletPassword, seed);
    console.log(JSON.stringify(encryptedSeed));
    window.localStorage.setItem("encryptedSeed", JSON.stringify(encryptedSeed));
    const options = {
      method: "POST",
      body: JSON.stringify({ seed: encryptedSeed, email: this.state.walletEmail }),
      mode: "cors",
      cache: "default",
    };
    fetch('http://localhost:8080/storetokens_email_pw.php', options).then(result => {
      console.log(result);
      result.json().then(response => {
        console.log(response);
        this.setState({hasWallet: true, unlockedWallet: true, web3, accounts});
      });
      
    });
    //console.log(seed);
    //console.log(encryptedSeed);
    //let decryptedSeed = await cryptoDecrypt(
    //  this.state.walletPassword,
    //  encryptedSeed.ciphertext,
    //  encryptedSeed.iv,
    //  encryptedSeed.salt
    //);
    //console.log(decryptedSeed);
  };

  logout = () => {
    this.setState({ isAuthenticated: false, token: "", user: null });
  };

  facebookResponse = (response) => {
    console.log(response);
    // const options = {
    //     method: 'POST',
    //     body: JSON.stringify({access_token: response.accessToken}),
    //     mode: 'cors',
    //     cache: 'default'
    // };
    // fetch('http://localhost:8080/storetokens.php', options).then(r => {
    //     //const token = r.headers.get('x-auth-token');
    //     r.json().then(user => {
    //       console.log(user);
    //         //if (token) {
    //             this.setState({isAuthenticated: true, user});
    //             this.startWeb3Init(user.id, config.FACEBOOK_APP_ID);
    //         //}
    //     });
    // })
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
          <input type="submit" value="Create new Wallet" />
        </form>
        <br />
        <FacebookLogin
          appId={config.FACEBOOK_APP_ID}
          autoLoad={false}
          fields="name,email,picture"
          callback={this.facebookRecover}
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
      </div>
    ) : 
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
        { !this.state.hasWalletRecovery ? (
        <div>

        <h1>Add Password Recovery</h1>
        <br />
        <FacebookLogin
          appId={config.FACEBOOK_APP_ID}
          autoLoad={false}
          fields="name,email,picture"
          callback={this.facebookResponse}
          textButton="Add Facebook Recovery"
        />
        </div>
        ) : (<div></div>)}
      </div>
    ;

    return <div className="App">{content}</div>;
  }
}

export default App;
