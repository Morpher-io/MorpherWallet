const BaseProvider = require("./providers/BaseProvider");
const MpesaProvider = require("./providers/MpesaProvider");
const {KES} = require('./enums/Currencies.json');
const {COLLECTION} = require('./enums/PaymentTypes.json');
const {MPESA} = require('./enums/Providers.json');

class PaymentService {

    _provider = new BaseProvider({});
    _amount = 0.0;
    _currency = KES;
    _type = COLLECTION;
    _account = null;

    get account() {
        return this._account;
    }

    constructor() {

    }

    set account(value) {
        this._account = value;
    }

    get amount() {
        return this._amount;
    }

    set amount(value) {
        this._amount = value;
    }

    get currency() {
        return this._currency;
    }

    set currency(value) {
        this._currency = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }


    get provider() {
        return this._provider;
    }

    set provider(value) {
        this._provider = value;
    }

    async transact() {
        try {
            const response = await  this.provider.process({
                amount: this.amount,
                currency: this.currency,
                type: this.type
            });
            return this.provider.transformResult(response);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = PaymentService;