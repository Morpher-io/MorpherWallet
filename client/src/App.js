import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import config from './config.json';
import FacebookLogin from 'react-facebook-login';

import "./App.css";

class App extends Component {
  state = { isAuthenticated: false, user: null, token: '', web3: null, accounts: null };


  startWeb3Init = async (user_id, app_id) => {
    try {
      const web3 = await getWeb3(false, user_id+""+app_id);
      console.log(web3);
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      this.setState({ web3, accounts });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }

  logout = () => {
    this.setState({isAuthenticated: false, token: '', user: null})
  };

  facebookResponse = (response) => {
        const options = {
            method: 'POST',
            body: JSON.stringify({access_token: response.accessToken}),
            mode: 'cors',
            cache: 'default'
        };
        fetch('http://localhost:8080/storetokens.php', options).then(r => {
            //const token = r.headers.get('x-auth-token');
            r.json().then(user => {
              console.log(user);
                //if (token) {
                    this.setState({isAuthenticated: true, user});
                    this.startWeb3Init(user.id, config.FACEBOOK_APP_ID);
                //}
            });
        })
  };

  onFailure = (error) => {
    alert(error);
  }

  sendEther = async (amount, to) => {
    const {web3, accounts} = this.state;
    let result = await web3.eth.sendTransaction({from:accounts[0],to, value: amount*1000000000000000000});
    console.log(result);

  }

  render() {
    let content = !!this.state.isAuthenticated ?
            (
                <div>
                    <p>Authenticated</p>
                    <h1>
                        Hi {this.state.user.email}
                    </h1>
                    {!this.state.web3 ?
                      <div>Loading Web3, accounts, and contract...</div>
                    :
                        <div>
                          <h2>Good to Go!</h2>
                          <p>Your Account: {this.state.accounts[0]}</p>
                          <button onClick={() => this.sendEther(0.1, '0x5AD2d0Ebe451B9bC2550e600f2D2Acd31113053E')}>SEND TRANSACTION</button>
                        </div>
                    }
                    <div>
                        <button onClick={this.logout} className="button">
                            Log out
                        </button>
                    </div>
                </div>
            ) :
            (
                <div>
                   
                    <FacebookLogin
                        appId={config.FACEBOOK_APP_ID}
                        autoLoad={false}
                        fields="name,email,picture"
                        callback={this.facebookResponse} />
                </div>
            );
   
    return (
      <div className="App">
        {content}
      </div>
    );
  }
}

export default App;
