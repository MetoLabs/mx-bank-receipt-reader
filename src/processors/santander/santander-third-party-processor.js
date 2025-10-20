import BaseProcessor from '../base-processor.js';

class SantanderThirdPartyProcessor extends BaseProcessor {
    /**
     * Extracts the account ID from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The account ID or null if not found
     */
    account_id(text) {
        const patterns = [
            /Cuenta de Cargo:\s*([^:\n\r]+?)\s{2,}Fecha y Hora Operación:/i,
            /Cuenta de Cargo:\s*([^:\n\r]+)/i,
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
            /Importe:\s*-?\$?([\d,]+\.?\d{2})/i,
            /Importe:\s*-?([\d,]+\.?\d{2})\s*MXP/i,
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
            /Referencia:\s*([^:\n\r]+?)\s{2,}Referencia numérica del Emisor:/i,
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
            /Fecha y Hora Operación:\s*([^:\n\r]+?)\s{2,}Fecha y Hora contable:/i,
            /Fecha y Hora Operación:\s*(\d{4}-\d{2}-\d{2})/i,
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
            /Concepto:\s*([^:\n\r]+?)\s{2,}Banco Participante:/i,
            /Concepto:\s*([^:\n\r]+)/i,
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
            /Tipo de Operación:\s*([^:\n\r]+?)\s{2,}Cuenta de Cargo:/i,
            /Tipo de Operación:\s*([^:\n\r]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }
}

export default SantanderThirdPartyProcessor;