import React, { Component } from "react";

const {
    changeEmail,
    getKeystoreFromEncryptedSeed
} = require("./morpher/backupRestore");

const { sha256 } = require("./morpher/cryptoFunctions");

export class ChangeEmail extends Component {
    state = {
        newEmail: '',
        password: ''
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
        if(!this.state.newEmail) return
        let storedPassword = window.sessionStorage.getItem("password")
        let password = await sha256(this.state.password);

        if(storedPassword === password) {
            let encryptedSeed = JSON.parse(localStorage.getItem("encryptedSeed"))
            let oldEmail = localStorage.getItem("email")
            await changeEmail(oldEmail, this.state.newEmail, encryptedSeed)
            window.localStorage.setItem("email", this.state.newEmail);
            alert('Password changed successfully.')

            this.setState({
                newEmail: '',
                password: ''
            });
        }

        else alert('Password is not right!')

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
        type="password"
        name="password"
        placeholder="Emter password"
        value={this.state.password}
        onChange={this.handleInputChange}
        />
        <input type="submit" value="Submit" />
            </form>

        return <div className="ChangeEmail">{content}</div>;
    }
}
