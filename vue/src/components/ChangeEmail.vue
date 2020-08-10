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
    const { sha256 } = require("../utils/cryptoFunctions");
    const {
        changeEmail,
    } = require("../utils/backupRestore");

    export default {
        name: "ChangeEmail",
        data: function(){
            return {
                newEmail: "",
                password: ""
            }
        },
        props: ['emailChanged'],
        methods: {
            async formSubmitChangeEmail (e) {
                e.preventDefault();
                if(!this.newEmail) return
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
                    this.emailChanged()
                }

                else alert('Password is not right!')

            }
        },
        mounted(){

        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
