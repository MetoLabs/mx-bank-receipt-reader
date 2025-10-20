import BaseProcessor from '../base-processor.js';

class BbvaThirdPartyProcessor extends BaseProcessor {
    /**
     * Extracts the account ID from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The account ID or null if not found
     */
    account_id(text) {
        const patterns = [
            /Cuenta de retiro:\s*(\d+)/i,
            /Cuenta de retiro\.?\s*(\d+)/i,
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
            /Importe de la operación:\s*\$\s*([\d,]+\.?\d{2})/i,
            /Importe de la operación\s*\$\s*([\d,]+\.?\d{2})/i,
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
            /Folio de internet:\s*(\d+)/i,
            /Folio de internet\.?\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the operation date from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The operation date or null if not found
     */
    operation_date(text) {
        const patterns = [
            /Fecha de la operación:\s*(\d{2}\/\d{2}\/\d{4})/i,
            /Fecha de la operación\s*(\d{1,2}\/\d{1,2}\/\d{4})/i
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the destination account from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The destination account or null if not found
     */
    destination_account(text) {
        const patterns = [
            /Cuenta asociada:\s*(\d+)/i,
            /Cuenta asociada\.?\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the concept from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The concept or null if not found
     */
    concept(text) {
        const patterns = [
            /Concepto de pago:\s*([^:\n\r]+?)\s{2,}Fecha de la operación:/i,
            /Concepto de pago:\s*([^:\n\r]+?)\s{2,}[A-Za-záéíóúñ]+\s*:/i,
            /Concepto de pago:\s*([^:\n\r]+)/i
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the operation type from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The operation type or null if not found
     */
    operation_type(text) {
        const patterns = [
            /Tipo de operación:\s*([^:\n\r]+?)\s{2,}Cuenta de retiro:/i,
            /Tipo de operación:\s*([^:\n\r]+?)\s{2,}[A-Za-záéíóúñ]+\s*:/i,
            /Tipo de operación:\s*([^:\n\r]+)/i
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }
}

export default BbvaThirdPartyProcessor;