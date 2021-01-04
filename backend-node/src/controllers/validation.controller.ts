export async function validateInput(req, res) {
    const fieldName = req.body.fieldName;
    const inputFieldValue = req.body.inputFieldValue;

    const validateReturn = { success: false, returnMessage: '', validationFails: [] };
    // Check that a valid field type was passed
    if (!['email', 'username', 'password'].includes(fieldName.toLocaleLowerCase())) {
        validateReturn.returnMessage = ' Field not recognised: ' + fieldName;
    }

    // Process email validation
    if (fieldName.toLocaleLowerCase() === 'email') {
        const validator = require('email-validator');

        // check the email format
        if (validator.validate(inputFieldValue)) {
            validateReturn.returnMessage = '';
        } else {
            validateReturn.returnMessage = 'EmailFormat';
            return res.json(validateReturn);
        }

        // check the MX record
        const emailDomainChecker = require('email-domain-check');

        const result = await emailDomainChecker(inputFieldValue);
        if (!result) {
            validateReturn.returnMessage = 'EmailMXRecord';
        } else {
            // check for blacklisted fake domains
            const blacklistMailChecker = require('mailchecker');

            if (!blacklistMailChecker.isValid(inputFieldValue)) {
                validateReturn.returnMessage = 'EmailBlacklisted';
            } else {
                validateReturn.success = true;
            }
        }

        return res.json(validateReturn);
    }

    // Process username validation
    else if (fieldName.toLocaleLowerCase() === 'username') {
        /*
            Check user names for bad words
                1. Check original user name
                2. Check user name with both leading and trailing numbers removed
                3. Check username with all digits removed
        */

        const badWords = require('bad-words'),
            badWordsFilter = new badWords();

        const withNoDigits = inputFieldValue.replace(/[0-9]/g, '');

        const regNumberCheck = /^\d+$/;
        let noLeadingOrTrailingDigits = inputFieldValue;
        // remove leading numbers
        while (noLeadingOrTrailingDigits.length > 0 && noLeadingOrTrailingDigits[0].match(regNumberCheck))
            noLeadingOrTrailingDigits = noLeadingOrTrailingDigits.substring(1);

        // Remove Trailing numbers
        while (
            noLeadingOrTrailingDigits.length > 0 &&
            noLeadingOrTrailingDigits[noLeadingOrTrailingDigits.length - 1].match(regNumberCheck)
        )
            noLeadingOrTrailingDigits = noLeadingOrTrailingDigits.substring(0, noLeadingOrTrailingDigits.length - 1);

        if (
            badWordsFilter.clean(withNoDigits) !== withNoDigits ||
            badWordsFilter.clean(inputFieldValue) !== inputFieldValue ||
            badWordsFilter.clean(noLeadingOrTrailingDigits) !== noLeadingOrTrailingDigits
        )
            validateReturn.returnMessage = 'UserBad';

        // check length
        if (inputFieldValue.length < 2) validateReturn.returnMessage = 'UserShort';

        // check for invalid symbols
        const usernameRegex = new RegExp(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/gim);

        if (!usernameRegex.test(inputFieldValue)) validateReturn.returnMessage = 'UserSymbol';

        validateReturn.success = validateReturn.returnMessage === '';

        return res.json(validateReturn);
    }

    // Process password validation
    else if (fieldName.toLocaleLowerCase() === 'password') {
        const passwordValidator = require('password-validator');

        // Create a schema for the password validator
        const schema = new passwordValidator();

        // set the password requirements
        schema
            .is()
            .min(8) // Minimum length 8
            .is()
            .max(50) // Maximum length 50
            .has()
            .uppercase() // Must have uppercase letters
            .has()
            .lowercase() // Must have lowercase letters
            .has()
            .digits(); // Must have digits

        const validationReturn = schema.validate(inputFieldValue, { list: true });

        if (validationReturn.length > 0) {
            validateReturn.returnMessage = 'Password insufficient';
            validateReturn.success = false;
            validationReturn.forEach(validationFail => {
                validateReturn.validationFails.push(validationFail);
            });
        } else {
            validateReturn.returnMessage = 'Password sufficient';
            validateReturn.success = true;
        }

        return res.json(validateReturn);
    } else return res.json(validateReturn);
}
