<template>
    <div>
        <form v-on:submit.prevent="formSubmitChangeEmail ">
            <input
                    type="text"
                    name="newEmail"
                    placeholder="New Email"
                    v-model="newEmail"
            />
            <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    v-model="password"
            />
            <input type="submit" value="Submit" />
        </form>
    </div>
</template>


<script>
    import isIframe from "../utils/isIframe";

    const { sha256 } = require("../utils/cryptoFunctions");
    const {
        changeEmail,
        validateInput
    } = require("../utils/backupRestore");

    export default {
        name: "ChangeEmail",
        data: function(){
            return {
                newEmail: "",
                password: "",
                showSpinner: false,
                status: "",
            }
        },
        props: ['emailChanged'],
        methods: {
            async formSubmitChangeEmail (e) {
                e.preventDefault();
                if(!this.newEmail) return;

                const emailMessage = await validateInput('email', this.newEmail);
                if(emailMessage) alert(emailMessage);

                else{
                    let storedPassword = window.sessionStorage.getItem("password")
                    let password = await sha256(this.password);
                    if(storedPassword === password) {
                        let encryptedSeed = JSON.parse(localStorage.getItem("encryptedSeed"))
                        let oldEmail = localStorage.getItem("email")
                        await changeEmail(oldEmail, this.newEmail, encryptedSeed)
                        window.localStorage.setItem("email", this.newEmail);
                        alert('Email changed successfully.')

                        this.newEmail = "";
                        this.password = "";
                        this.emailChanged();
                        await this.logout();
                    }

                    else alert('Password is not right!')
                }
            },

            async logout() {
                this.showSpinner = true;
                this.status = "Logging out...";
                if (isIframe()) {
                    (await this.connection.promise).onLogout();
                }
                localStorage.clear();
                window.location.reload();
            }
        },
        mounted(){

        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
