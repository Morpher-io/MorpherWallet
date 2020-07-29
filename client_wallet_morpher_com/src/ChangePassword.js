import React, { Component } from "react";

const {
  saveWalletEmailPassword,
  getKeystoreFromEncryptedSeed,
  changePasswordEncryptedSeed,
} = require("./morpher/backupRestore");

const { sha256 } = require("./morpher/cryptoFunctions");

export class ChangePassword extends Component {
    state = {
      oldPassword: '',
      newPassword: '',
      newPasswordRepeat: ''
    };

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value,
        });
    };
  

    formSubmitChangePassword = async (e) => {
        e.preventDefault();

        if(this.state.newPassword === this.state.newPasswordRepeat) {
            let encryptedSeed = JSON.parse(localStorage.getItem("encryptedSeed"))

            const oldPassword = await sha256(this.state.oldPassword);
            const newPassword = await sha256(this.state.newPassword);

            try{
                await getKeystoreFromEncryptedSeed(encryptedSeed, oldPassword);                 
            }
            catch(e){
                alert('Old password is not right.')
            }

            const newEncryptedSeed = await changePasswordEncryptedSeed(encryptedSeed, oldPassword, newPassword);

            await saveWalletEmailPassword(window.localStorage.getItem("email"), newEncryptedSeed)

            window.localStorage.setItem("encryptedSeed", JSON.stringify(newEncryptedSeed));

            window.sessionStorage.setItem("password", newPassword);

            alert('Password changed successfully.')

            this.setState({
              oldPassword: '',
              newPassword: '',
              newPasswordRepeat: ''
            });
        }
        
        else alert('New passwords do not match.')
      };

    render() {
        let content = <form onSubmit={this.formSubmitChangePassword}>
          <input
            type="password"
            name="oldPassword"
            placeholder="Old Password"
            value={this.state.oldPassword}
            onChange={this.handleInputChange}
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={this.state.newPassword}
            onChange={this.handleInputChange}
          />
          <input
            type="password"
            name="newPasswordRepeat"
            placeholder="New Password Again"
            value={this.state.newPasswordRepeat}
            onChange={this.handleInputChange}
          />
          <input type="submit" value="Submit" />
        </form>

        return <div className="ChangePassword">{content}</div>;
      }
}  