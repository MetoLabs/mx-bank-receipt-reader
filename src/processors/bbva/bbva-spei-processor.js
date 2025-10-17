import BaseProcessor from '../base-processor.js';

class BbvaSpeiProcessor extends BaseProcessor {
    /**
     * Extracts the account ID from the receipt text.
     * 
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The account ID or null if not found
     */
    account_id(text) {
        const patterns = [
            /Cuenta de retiro\.?\s*(\d+)/i,
            /Cuenta de retiro[^]*?(\d{10,})/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the transaction amount from the receipt text.
     * 
     * @param {string} text - The receipt text to extract from
     * @returns {number|null} The transaction amount as a number or null if not found
     */
    amount(text) {
        const patterns = [
            /Importe\s*\$\s*([\d,]+\.?\d{2})/i,
            /IMPORTE\s*\$\s*([\d,]+\.?\d{2})/i,
        ];
        const amount = this._extractWithPatterns(text, patterns);
        return amount ? parseFloat(amount.replace(/[^\d.]/g, '')) : null;
    }

    /**
     * Extracts the reference number from the receipt text.
     * 
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The reference number or null if not found
     */
    reference(text) {
        const patterns = [
            /Referencia numérica\s*(\d+)/i,
            /REFERENCIA.*NUMÉRICA\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }
}

export default BbvaSpeiProcessor;