import BaseProcessor from '../base-processor.js';

class HsbcSpeiProcessor extends BaseProcessor {
    /**
     * Extracts the account ID from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The account ID or null if not found
     */
    account_id(text) {
        const patterns = [
            /Número\s+de\s+cuenta\s*(\d+)/i,
            /CLABE\s+emisor\s*(\d+)/i,
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
            /Monto\s*bruto\s*MXN\s*([\d,]+\.?\d{2})/i,
            /Monto\s*MXN\s*([\d,]+\.?\d{2})/i,
            /Moneda\/\s*Monto\s*MXN\s*([\d,]+\.?\d{2})/i,
        ];
        const amount = this._extractWithPatterns(text, patterns);
        if (amount) {
            const cleanAmount = amount.replace(/[^\d.]/g, '');
            return parseFloat(cleanAmount);
        }
        return null;
    }

    /**
     * Extracts the reference number from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The reference number or null if not found
     */
    reference(text) {
        const patterns = [
            /Referencia\s+de\s+cliente\s*(\d+)/i,
            /Referencia\s+numérica\s*(\d+)/i,
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
            /Fecha\s+de\s+liquidación\s*(\d{1,2}\s+\w{3}\s+\d{4})/i,
            /Fecha\s+y\s+hora\s+de\s+liquidación\s*(\d{1,2}\s+\w{3}\s+\d{4})/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        if (result) {
            const months = {
                'Ene': '01', 'Jan': '01',
                'Feb': '02',
                'Mar': '03',
                'Abr': '04', 'Apr': '04',
                'May': '05',
                'Jun': '06',
                'Jul': '07',
                'Ago': '08', 'Aug': '08',
                'Sep': '09',
                'Oct': '10',
                'Nov': '11',
                'Dic': '12', 'Dec': '12'
            };
            const parts = result.split(/\s+/);
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = months[parts[1]] || '01';
                const year = parts[2];
                return `${day}/${month}/${year}`;
            }
        }
        return result;
    }

    /**
     * Extracts the destination account from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The destination account or null if not found
     */
    destination_account(text) {
        const patterns = [
            /Cuenta\s+beneficiaria\s*(\d+)/i,
            /Código\s+del\s+banco\s+receptor\s*(\d+)/i,
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
            /SEPSA\s+([A-Z\s]+?)\s{2,}Dirección/i,
            /SEPSA\s+([A-Z\s]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim().replace(/\s+/g, ' ') : null;
    }

    /**
     * Extracts the concept from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The concept or null if not found
     */
    concept(text) {
        const patterns = [
            /Concepto\s+de\s+pago\s*([^:\n\r]+?)\s{2,}Referencia\s+numérica/i,
            /Concepto\s+de\s+pago\s*([^:\n\r]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim().replace(/\s+/g, ' ') : null;
    }

    /**
     * Extracts the tracking key from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The tracking key or null if not found
     */
    tracking_key(text) {
        const patterns = [
            /Clave\s+de\s+rastreo\s*([A-Za-z0-9]+)/i,
            /Clave\s+de\s+rastreo\s*(\w+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the bank reference from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The bank reference or null if not found
     */
    bank_reference(text) {
        const patterns = [
            /Referencia\s+bancaria\s*(\d+)/i,
            /Referencia\s+relacionada\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }
}

export default HsbcSpeiProcessor;