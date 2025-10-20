import BaseProcessor from '../base-processor.js';

class SantanderSpeiProcessor extends BaseProcessor {
    /**
     * Extracts the account ID from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The account ID or null if not found
     */
    account_id(text) {
        const patterns = [
            /Cuenta Cargo:\s*([^:\n\r]+?)\s{2,}Cuenta Abono:/i,
            /Cuenta Cargo:\s*(\d+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the transaction amount from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {number|null} The transaction amount as a number or null if not found
     */
    amount(text) {
        const patterns = [
            /Importe:\s*\$\s*([\d,]+\.?\d{2})/i,
            /Importe:\s*\$?\s*([\d,]+\.?\d{2})\s*MXN/i,
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
            /Referencia:\s*([^:\n\r]+?)\s{2,}Referencias del Movimiento:/i,
            /Referencia:\s*([^:\n\r]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the operation date from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The operation date or null if not found
     */
    operation_date(text) {
        const patterns = [
            /Fecha aplicación:\s*([^:\n\r]+?)\s{2,}RFC Beneficiario:/i,
            /Fecha aplicación:\s*(\d{2}\/\d{2}\/\d{4})/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the destination account from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The destination account or null if not found
     */
    destination_account(text) {
        const patterns = [
            /Cuenta Abono:\s*([^:\n\r]+?)\s{2,}Importe:/i,
            /Cuenta Abono:\s*(\d+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the beneficiary name from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The beneficiary name or null if not found
     */
    beneficiary_name(text) {
        const patterns = [
            /Cuenta Abono:\s*\d+\s*-\s*([^:\n\r]+?)\s{2,}Importe:/i,
            /Cuenta Abono:[^-]+-\s*([^\n\r]+)/i,
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
            /Concepto:\s*([^:\n\r]+?)\s{2,}Fecha aplicación:/i,
            /Concepto:\s*([^:\n\r]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the status from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The status or null if not found
     */
    status(text) {
        const patterns = [
            /Estado:\s*([^:\n\r]+?)\s{2,}Divisa:/i,
            /Estado:\s*([^:\n\r]+)/i,
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
            /Tipo de Operación:\s*([^:\n\r]+?)\s{2,}Contrato:/i,
            /Tipo de Operación:\s*([^:\n\r]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }
}

export default SantanderSpeiProcessor;