import BaseProcessor from '../base-processor.js';

class SantanderThirdPartyProcessor extends BaseProcessor {
    /**
     * Extracts the account ID from the receipt text.
     * 
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The account ID or null if not found
     */
    account_id(text) {
        return null;
    }

    /**
     * Extracts the transaction amount from the receipt text.
     * 
     * @param {string} text - The receipt text to extract from
     * @returns {number|null} The transaction amount as a number or null if not found
     */
    amount(text) {
        return null;
    }

    /**
     * Extracts the reference number from the receipt text.
     * 
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The reference number or null if not found
     */
    reference(text) {
        return null;
    }
}

export default SantanderThirdPartyProcessor;