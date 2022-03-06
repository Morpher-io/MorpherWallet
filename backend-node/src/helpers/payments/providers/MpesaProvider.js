const BaseProvider = require("./BaseProvider");
const Mpesa = require("mpesa-api").Mpesa;
const path = require("node:path");
const {baseUrl} = require('../../../../../../config/vars');
const {PENDING} = require("../enums/PaymentStatus.json");

class MpesaProvider extends BaseProvider{

    // TODO: add a way to get sensitive inforamtion

    consumer_key = "UtktAROGXjf63QT5wT7yokvJ3K2xGSoY";
    consumer_secret = "OGIb0ruJ8q8r1uXL";
    initiator_password = "Safaricom426!";
    lipa_na_mpesa_pass_key = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    security_credentials = "HtqJmFpmfszRXRPsQOxgBsp+ReBukYTRvSyRbV7nelWn0TZOtPfYyBhCKNY+IRkIRtwTKiy/xWcgLqsoyZ3EyVWZNyvyXI65pEqalXruICqzRb4ADI7HZ6J4dE8T35ilWs2mQsSuxESoolCCKra/px4tr0QbiqoNj8UqGSOkUPGwwjbJn5hNAg790alZtajv78rw9egB9754oZOZDpyAyuoZQwVxJByLH+Mya6i+0y1mK8IIP6tst17CyJ4K9cdeNlmLoJJ13jOWsDQcJb/msySzbDfji0Utl8w+mwkelZ2AoNCU36RZboKmbrnHyuQ8tt8CKS/f9NduDZDZzOAAsA==";

    //lipa_na_mpesa_passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    //oauth_token_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    //lipa_na_mpesa_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    //payment_request_url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";

    constructor({account, description}) {

        // TODO: validate mobile number

        super({account, description});

        const credentials = {
            clientKey: this.consumer_key,
            clientSecret: this.consumer_secret,
            initiatorPassword: this.initiator_password,
            securityCredential: this.security_credentials,
            certificatePath: null
        };

        this.mpesaInstance = new Mpesa(credentials, "sandbox");

    }


    async processCollection() {
        return await this.lipaNaMpesaOnline();
    }


    async processReimbursement() {
        return await this.b2c();
    }


    transformResult(response) {
        return super.transformResult(response);
    }

    async processReversal(mpesaReference) {
        return await this.reversal(mpesaReference)
    }

    getIdentifier() {
        return this.payload.account
    }


    b2c() {
        //const { shortCode } = this.mpesaInstance.configs
        const mobileNumber = this.payload.account;
        const amount = parseInt(this.payload.amount, 10); //you can enter any amount

        const successCallback = "https://webhook.site/ffeaa820-b8c4-4b9d-8290-ed91ce9b0f32";
        const timeoutCallback = "https://webhook.site/ffeaa820-b8c4-4b9d-8290-ed91ce9b0f32";

        return new Promise(async (resolve, reject) => {
            try {
                let data = await this.mpesaInstance.b2c({
                    Initiator: "testapi", // TODO: make this in enviroment
                    Amount: amount /* 1000 is an example amount */,
                    PartyA: "600426",
                    PartyB: mobileNumber,
                    QueueTimeOutURL: timeoutCallback,
                    ResultURL: successCallback,
                    CommandID: "BusinessPayment" /* OPTIONAL */,
                    Occasion: "Occasion" /* OPTIONAL */,
                    Remarks: "Remarks" /* OPTIONAL */,
                });
                if(data['ResponseCode'] !== '0') {
                    return reject(data);
                }

                this.providerReference = data['ConversationID'] || '';
                //this.status = 'PENDING';

                return resolve(data)
            } catch(err){
                if(err.response) {
                    return reject(new Error(JSON.stringify(err.response.data)));
                }
                return reject(err)
            }
        });
    }

    lipaNaMpesaOnline(){
        // TODO: look at these
        // TODO: put this in the enviroment
        let callBackUrl = `${baseUrl}/wallet/callback`;

        let phoneNumber = this.payload.account; //should follow the format:2547xxxxxxxx
        let amount = parseInt(this.payload.amount, 10); //you can enter any amount
        // const accountRef = Math.random().toString(35).substr(2, 7)
        const accountRef = this.payload.account;
        return new Promise(async (resolve, reject) => {
            try {

                let data = await this.mpesaInstance.lipaNaMpesaOnline({
                    BusinessShortCode: 174379, // TODO: make this an environment
                    PartyB: 174379, // TODO: make this an environment
                    Amount: amount /* 1000 is an example amount */,
                    PartyA: phoneNumber,
                    PhoneNumber: phoneNumber,
                    CallBackURL: callBackUrl,
                    AccountReference: accountRef,
                    passKey: this.lipa_na_mpesa_pass_key,
                    TransactionType: "CustomerPayBillOnline" /* OPTIONAL */, //CustomerBuyGoodsOnline
                    TransactionDesc: "Transaction Description" /* OPTIONAL */,
                })

                //console.log(data);

                if(data['ResponseCode'] !== '0') {
                     return reject(data);
                }

                this.providerReference = data['CheckoutRequestID'] || '';
                this.status = PENDING;
                this.statusReason = data['ResponseDescription'] || "";

                return resolve(data)

            }catch(err){
                if(err.response) {
                    return reject(new Error(JSON.stringify(err.response.data)));
                }
                return reject(err)
            }
        });

    };

    reversal(mpesaReference) {

        const { shortCode } = this.mpesaInstance.configs
        const mobileNumber = this.payload.account;
        const amount = parseInt(this.payload.amount, 10); //you can enter any amount

        const successCallback = "https://webhook.site/83f9c434-80fd-4ae0-86ee-a5b8ef85296c";
        const timeoutCallback = "https://webhook.site/83f9c434-80fd-4ae0-86ee-a5b8ef85296c";

        return new Promise(async (resolve, reject) => {
            try {
                let {data} =  await this.mpesaInstance.reversal({
                    Initiator: "testapi", // TODO: make this in enviroment
                    TransactionID: mpesaReference,
                    Amount: amount /* 1000 is an example amount */,
                    ReceiverParty: 174379, // TODO: make this an environment
                    ResultURL: successCallback,
                    QueueTimeOutURL: timeoutCallback,
                    CommandID: "TransactionReversal" /* OPTIONAL */,
                    RecieverIdentifierType: 11 /* OPTIONAL */,
                    Remarks: "Remarks" /* OPTIONAL */,
                    Occasion: "Ocassion" /* OPTIONAL */,
                })
                if(data['ResponseCode'] !== '0') {
                    return reject(data);
                }

                this.providerReference = data['ConversationID'] || '';
                this.status = 'PENDING';
                this.statusReasson = data['ResponseDescription'] || '';

                return resolve(data)
            } catch(err){
                if(err.response) {
                    return reject(new Error(JSON.stringify(err.response.data)));
                }
                return reject(err)
            }
        });


    }
}

module.exports = MpesaProvider;