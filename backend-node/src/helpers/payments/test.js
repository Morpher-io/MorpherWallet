const PaymentService = require("./PaymentService");
const {COLLECTION, REIMBURSEMENT} = require("./enums/PaymentTypes.json")
const {KES} = require("./enums/Currencies.json")
const MpesaProvider = require("./providers/MpesaProvider");
const paymentService = new PaymentService();

paymentService.amount = 10.0;
paymentService.type = REIMBURSEMENT;
paymentService.currency = KES;

const paymentProvider = new MpesaProvider({account: "254700928129", description: `REIMBURSEMENT of ${paymentService.currency}${paymentService.account}`});

paymentService.provider = paymentProvider;

paymentService.transact().then(r => {
    console.log(paymentProvider.providerReference)
    console.log(r);
}).catch(e => console.error);