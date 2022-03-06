const {COLLECTION, REIMBURSEMENT} = require('../enums/PaymentTypes.json');
const axios = require('axios');

class BaseProvider {
    get statusReason() {
        return this._statusReason;
    }

    set statusReason(value) {
        this._statusReason = value;
    }
    get fulfillmentReference() {
        return this._fulfillmentReference;
    }

    set fulfillmentReference(value) {
        this._fulfillmentReference = value;
    }


    // TODO: add a way to get sensitive inforamtion
    get status() {
        return this._status;
    }

    set status(value) {
        this._status = value;
    }
    _httpClient = null;
    _payload = null;
    _fulfillmentReference = null;

    _statusReason = null;

    get providerReference() {
        return this._providerReference;
    }

    set providerReference(value) {
        this._providerReference = value;
    }

    _providerReference = null;
    _status = 'PENDING'; // TODO: use enums

    constructor({...config}) {
        this.payload = {...this.payload,...config};
        this.httpClient = axios.create({});
    }

    get payload() {
        return this._payload;
    }

    set payload(value) {
        this._payload = value;
    }

    get httpClient() {
        return this._httpClient;
    }

    set httpClient(value) {
        this._httpClient = value;
    }

    describe() {
        return JSON.stringify(this, null, 2)
    }

    transformResult(response) {
        return {response, providerReference: this.providerReference, transactionId: this.providerReference, status: this.status, statusReason: this.statusReason, fulfillmentReference: this.fulfillmentReference};
    }

    processReversal() {
        return new Error('Unimplemented');
    }

    processCollection() {
        const paymentData = this.payload;
        return new Error('Unimplemented');
    }

    processReimbursement() {
        const paymentData = this.payload;
        return new Error('Unimplemented');
    }

    async process({amount, currency, type, ...payload}) {

        this.payload = {...this.payload, amount, currency, type, ...payload};

        let response = null
        switch (type) {
            case COLLECTION:
                response = await this.processCollection();
                break;
            case REIMBURSEMENT:
                response = await this.processReimbursement()
                break;
            default:
                throw new Error("Invalid payment type provided");
        }
        return response;
    }

    getIdentifier() {
        throw new Error("Unimplemented");
    }

    getProviderReference() {
        return this.providerReference;
    }
}

module.exports = BaseProvider;