import BaseProcessor from '../base-processor.js';

class BanorteThirdPartyProcessor extends BaseProcessor {
    /**
     * Extracts the account ID from the receipt text.
     */
    account_id(text) {
        const patterns = [
            /Cuenta\/ CLABE Ordenante\s*(\d+)/i,
            /Cuenta Ordenante\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the transaction amount from the receipt text.
     */
    amount(text) {
        const patterns = [
            /Importe a Transferir\s*\$\s*([\d,]+\.?\d{2})/i,
        ];
        const amount = this._extractWithPatterns(text, patterns);
        return amount ? parseFloat(amount.replace(/[^\d.]/g, '')) : null;
    }

    /**
     * Extracts the reference number from the receipt text.
     */
    reference(text) {
        const patterns = [
            /Referencia numérica\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the operation date from the receipt text.
     */
    operation_date(text) {
        const patterns = [
            /Fecha Aplicación\s*(\d{1,2}\/\w+\.\/\d{4})/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? this._convertDate(result) : null;
    }

    /**
     * Extracts the destination account from the receipt text.
     */
    destination_account(text) {
        const patterns = [
            /Cuenta\/ CLABE Beneficiario\s*(\d+)/i,
            /Cuenta Beneficiario\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the beneficiary name from the receipt text.
     */
    beneficiary_name(text) {
        const patterns = [
            /Nombre del Beneficiario\s*([^\n\r]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the concept from the receipt text.
     */
    concept(text) {
        const patterns = [
            /Propósito de la Transferencia\s*([^\n\r]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the tracking key from the receipt text.
     */
    tracking_key(text) {
        const patterns = [
            /Clave de Rastreo\s*([A-Za-z0-9]+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the operation type from the receipt text.
     */
    operation_type(text) {
        return "Transferencia a Terceros Banorte";
    }

    /**
     * Converts date from "07/oct./2025" to "07/10/2025"
     */
    _convertDate(dateString) {
        if (!dateString) return null;

        const months = {
            'ene.': '01', 'feb.': '02', 'mar.': '03', 'abr.': '04',
            'may.': '05', 'jun.': '06', 'jul.': '07', 'ago.': '08',
            'sep.': '09', 'oct.': '10', 'nov.': '11', 'dic.': '12'
        };

        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = months[parts[1].toLowerCase()] || '01';
            const year = parts[2];
            return `${day}/${month}/${year}`;
        }
        return dateString;
    }
}

export default BanorteThirdPartyProcessor;