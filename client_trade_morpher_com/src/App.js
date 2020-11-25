/**
 * Sample app using the wallet-sdk
 */
import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import ZeroWallet from "zerowallet-sdk";
import "./App.css";
//import { connectToChild } from 'penpal';

class App extends Component {
  //connection;

  state = {
    walletEmail: "",
    walletPassword: "",
    walletAddress: "",
    isAuthenticated: false,
    user: null,
    token: "",
    web3: null,
    accounts: null,
    hasWallet: false,
    hasWalletRecovery: false,
    loginFailure: false,
    showWallet: true,
    balance: 0,
    targetAddress: "0x123",
    numberOfEther: 0,
  };

  async componentDidMount() {

    this.zeroWallet = new ZeroWallet("ws://127.0.0.1:7545", 5777);
    //let web3 = await this.zeroWallet.getProvider();

    let res = await this.zeroWallet.isLoggedIn();
    if (res.isLoggedIn === true) {
      this.setState({ walletEmail: res.walletEmail });
      let web3 = await getWeb3();
      let accounts = await web3.eth.getAccounts();
      console.log(accounts);
      this.setState({ isAuthenticated: true, web3 });
    }

    this.zeroWallet.onLogin(async (walletAddress, walletEmail) => {
      console.log("On Login arrived");
      this.setState({ walletEmail: walletEmail });
      this.setState({ walletAddress: walletAddress });
      let web3 = await getWeb3();

      let accounts = await web3.eth.getAccounts();
      console.log(accounts);
      this.setState({ isAuthenticated: true, web3 });
      let balance = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), "ether");
      this.setState({balance});
      this.toggleWallet();

    });

    this.zeroWallet.onLogout(() => {
      this.setState({ walletEmail: "" });
      this.setState({ walletAddress: "" });
      this.setState({ isAuthenticated: false });
    });
  }

  sendEther = async (e) => {
    e.preventDefault();
    let amount = this.state.numberOfEther;
    let to = this.state.targetAddress;
    const { web3, walletAddress } = this.state;
    let result = await web3.eth.sendTransaction({
      from: walletAddress,
      to,
      value: amount * 1000000000000000000,
    });
    if(result.status === true) {
      alert("Sent was successful");
      let accounts = await web3.eth.getAccounts();
      let balance = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), "ether");
      this.setState({balance});
    }
    console.log(result);
  };

  toggleWallet = async() => {
    if(this.state.showWallet) {
      document.getElementsByClassName("zerowallet-iframe")[0].style.display = "none"
      this.setState({ showWallet: false });

    } else {
      document.getElementsByClassName("zerowallet-iframe")[0].style.display = ""
      this.setState({ showWallet: true });

    }

  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  };

  logout = () => {
    localStorage.clear();
    //this.setState({ isAuthenticated: false, token: "", user: null, web3: null, hasWallet:false });
    window.location.reload();
  };

  onFailure = (error) => {
    alert(error);
  };


  render() {
    let content = this.state.isAuthenticated ? (
      <div>
        <h2>Hi {this.state.walletEmail}</h2>{" "}
        <div>
          <span>Your Balance is {this.state.balance} ether</span>
          <h3>Send some Ether</h3>
          <form onSubmit={this.sendEther}>
          Target Address: <input
            type="text"
            name="targetAddress"
            placeholder="0x123"
            value={this.state.targetAddress}
            onChange={this.handleInputChange}
          /><br />
          Ether: 
          <input
            type="text"
            name="numberOfEther"
            placeholder="1"
            value={this.state.numberOfEther}
            onChange={this.handleInputChange}
            className="Input"
          /><br />
          <input type="submit" value="Send Now" />
        </form>
          <br />
          <br />
          <br />
          <button onClick={this.toggleWallet}>Show/Hide Wallet</button>
        </div>
      </div>
    ) : (
      <div>Not logged in!</div>
    );
    return (
      <div className="App">
        <h1>Welcome to the trade engine!</h1>
        
        <br />
        {content}
      </div>
    );
  }
}

export default App;
