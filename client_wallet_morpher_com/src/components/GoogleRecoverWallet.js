import React, { Component } from "react";
import { GoogleLogin } from "react-google-login";
import config from "../config.json";
import {
  changePasswordEncryptedSeed,
  recoverGoogleSeed,
  saveWalletEmailPassword,
} from "../morpher/backupRestore";

import { sha256 } from "../morpher/cryptoFunctions";

/**
 * This is used to recover from password loss via Google
 */
class GoogleRecoverWallet extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogined: false,
      loginButtonText: props.loginButtonText || "Recover Wallet with Google",
      logoutButtonText: props.loginButtonText || "Remove Google Recovery",
      walletEmail: props.walletEmail,
    };

    this.login = this.login.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
    this.logout = this.logout.bind(this);
    this.handleLogoutFailure = this.handleLogoutFailure.bind(this);
  }

  async login(response) {
    if (response.accessToken) {
      try {
        let encryptedSeedFacebook = await recoverGoogleSeed(
          response.accessToken
        );
        var newPasswordForLocalStorage = prompt(
          "Enter a new password for you local vault",
          "Super Strong Pass0wrd!"
        );
        //double hashing the password
        newPasswordForLocalStorage = await sha256(newPasswordForLocalStorage);
        let encryptedSeedPassword = await changePasswordEncryptedSeed(
          encryptedSeedFacebook,
          response.profileObj.googleId,
          newPasswordForLocalStorage
        );
        saveWalletEmailPassword(this.state.walletEmail, encryptedSeedPassword);
        window.localStorage.setItem("encryptedSeed", JSON.stringify(encryptedSeedPassword));
        window.sessionStorage.setItem("password", newPasswordForLocalStorage);
        this.props.recoverySuccessful();
      } catch (e) {
        console.log(e);
        alert(
          "Your account wasn't found with Google recovery, create one with username and password first"
        );
      }
      
    }
  }

  logout(response) {
    this.setState((state) => ({
      isLogined: false,
      accessToken: "",
    }));
  }

  handleLoginFailure(response) {
    alert("Failed to log in");
    console.error(response);
  }

  handleLogoutFailure(response) {
    alert("Failed to log out");
  }

  render() {
    return (
      <div>
        <GoogleLogin
          clientId={config.GOOGLE_APP_ID}
          buttonText={this.state.loginButtonText}
          onSuccess={this.login}
          onFailure={this.handleLoginFailure}
          cookiePolicy={"single_host_origin"}
          responseType="code,token"
        />
      </div>
    );
  }
}

export default GoogleRecoverWallet;
