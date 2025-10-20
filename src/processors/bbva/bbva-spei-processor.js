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
            /Cuenta Retiro:\s*(\d+)/i,
            /Cuenta Retiro:\s*(\d{16,})/i,
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
            /Importe:\s*\$\s*([\d,]+\.?\d{2})/i,
            /Importe:\s*\$?\s*([\d,]+\.?\d{2})/i,
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
            /Referencia Numérica:\s*(\d+)/i,
            /Referencia Numérica:\s*(\d{7})/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the operation date from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The operation date or null if not found
     */
    date(text) {
        const patterns = [
            /Fecha de Operación:\s*(\d{2}\/\d{2}\/\d{4})/i,
            /Fecha de Operación:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the destination bank from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The destination bank or null if not found
     */
    destination_bank(text) {
        const patterns = [
            /Banco Destino:\s*([^:\n\r]+?)\s{2,}Cuenta Asociada:/i,
            /Banco Destino:\s*([^:\n\r]+?)\s{2,}[A-Za-záéíóúñ]+\s*:/i,
            /Banco Destino:\s*([^:\n\r]+)/i
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
            /Cuenta Asociada:\s*(\d+)/i,
            /Cuenta Asociada:\s*(\d{16,})/i,
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
            /Nombre del beneficiario:\s*([^:\n\r(]+?)\s{2,}\(/i,
            /Nombre del beneficiario:\s*([^:\n\r(]+?)\s{2,}[A-Za-záéíóúñ]+\s*:/i,
            /Nombre del beneficiario:\s*([^:\n\r(]+)/i
        ];

        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
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
            /Clave de Rastreo:\s*(\w{20,})/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the status from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The status or null if not found
     */
    status(text) {
        const patterns = [
            /Estatus:\s*([^:\n\r]+?)\s{2,}Clave de Rastreo:/i,
            /Estatus:\s*([^:\n\r]+?)\s{2,}[A-Za-záéíóúñ]+\s*:/i,
            /Estatus:\s*([^:\n\r]+)/i
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
            /Concepto de Pago:\s*([^:\n\r]+?)\s{2,}[A-Za-záéíóúñ]+\s*:/i,
            /Concepto de Pago:\s*([^:\n\r]+?)\s{2,}Referencia Numérica:/i,
            /Concepto de Pago:\s*([^:\n\r]+?)\s{2,}Estatus:/i,
            /Concepto de Pago:\s*([^:\n\r]+)/i
        ];

        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }
}

export default BbvaSpeiProcessor;