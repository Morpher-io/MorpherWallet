import React, { Component } from "react";

const {
    changeEmail,
    getKeystoreFromEncryptedSeed
} = require("./morpher/backupRestore");

const { sha256 } = require("./morpher/cryptoFunctions");

export class ChangeEmail extends Component {
    state = {
        newEmail: '',
        newEmailRepeat: ''
    };

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value,
        });
    };


    formSubmitChangeEmail = async (e) => {
        e.preventDefault();

        if(this.state.newEmail === this.state.newEmailRepeat) {
            let encryptedSeed = JSON.parse(localStorage.getItem("encryptedSeed"))
            let oldEmail = localStorage.getItem("email")
            console.log(oldEmail)
            await changeEmail(oldEmail, this.state.newEmail, encryptedSeed)
            window.localStorage.setItem("email", this.state.newEmail);
            alert('Password changed successfully.')

            this.setState({
                newEmail: '',
                newEmailRepeat: ''
            });
        }

        else alert('New emails do not match.')

    };

    render() {
        let content = <form onSubmit={this.formSubmitChangeEmail}>
        <input
        type="text"
        name="newEmail"
        placeholder="New Email"
        value={this.state.newEmail}
        onChange={this.handleInputChange}
        />
        <input
        type="text"
        name="newEmailRepeat"
        placeholder="New Email Again"
        value={this.state.newEmailRepeat}
        onChange={this.handleInputChange}
        />
        <input type="submit" value="Submit" />
            </form>

        return <div className="ChangeEmail">{content}</div>;
    }
}
