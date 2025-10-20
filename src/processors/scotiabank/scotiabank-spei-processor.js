import BaseProcessor from '../base-processor.js';

class ScotiabankSpeiProcessor extends BaseProcessor {
    /**
     * Extracts the account ID from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The account ID or null if not found
     */
    account_id(text) {
        const patterns = [
            /Cuenta de cargo\s*([A-Z0-9-]+)/i,
            /Cuenta de cargo:\s*([A-Z0-9-]+)/i,
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
            /Importe\s*([\d,]+\.?\d{2})/i,
            /Importe:\s*([\d,]+\.?\d{2})/i,
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
            /Referencia \(Numérica\):\s*(\d+)/i,
            /Referencia:\s*(\d+)/i,
            /Folio:\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the tracking key from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The tracking key or null if not found
     */
    tracking_key(text) {
        const patterns = [
            /Clave de Rastreo:\s*([A-Za-z0-9]+)/i,
            /Clave de Rastreo\s*([A-Za-z0-9]+)/i,
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
            /Fecha de Operación:\s*(\d{4}\/\d{2}\/\d{2})/i,
            /Fecha de aplicación:\s*(\d{4}\/\d{2}\/\d{2})/i,
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
            /Cuenta de Abono:\s*(\d+)/i,
            /Cuenta de Abono\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the beneficiary name from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The beneficiary name or null if not found
     */
    beneficiary_name(text) {
        const patterns = [
            /Nombre Beneficiario\/Razón Social:\s*([^\n\r]+)/i,
            /Nombre Beneficiario:\s*([^\n\r]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the concept from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The concept or null if not found
     */
    concept(text) {
        const patterns = [
            /Concepto:\s*([^\n\r]+)/i,
            /Concepto\s*([^\n\r]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }
}

export default ScotiabankSpeiProcessor;