import BaseProcessor from '../base-processor.js';

class BanbajioSpeiProcessor extends BaseProcessor {
    /**
     * Extracts the account ID from the receipt text.
     */
    account_id(text) {
        const patterns = [
            /Cuenta Origen:\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the transaction amount from the receipt text.
     */
    amount(text) {
        const patterns = [
            /Importe:\s*\$\s*([\d,]+\.?\d{2})/i,
        ];
        const amount = this._extractWithPatterns(text, patterns);
        return amount ? parseFloat(amount.replace(/[^\d.]/g, '')) : null;
    }

    /**
     * Extracts the reference number from the receipt text.
     */
    reference(text) {
        const patterns = [
            /Referencia:\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the operation date from the receipt text.
     */
    operation_date(text) {
        const patterns = [
            /Fecha de Operación:\s*(\d{2}-\w{3}-\d{4})/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? this._convertDate(result) : null;
    }

    /**
     * Extracts the destination account from the receipt text.
     */
    destination_account(text) {
        const patterns = [
            /Cuenta Destino:\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the beneficiary name from the receipt text.
     */
    beneficiary_name(text) {
        const patterns = [
            /Nombre del Beneficiario:\s*([A-Z\s]+?)\s{2,}[A-Z]/i,
            /Nombre del Beneficiario:\s*([A-Z\s]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the concept from the receipt text.
     */
    concept(text) {
        const patterns = [
            /Concepto de Pago:\s*([A-Z\s]+?)\s{2,}Referencia:/i,
            /Concepto de Pago:\s*([A-Z\s]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the tracking key from the receipt text.
     */
    tracking_key(text) {
        const patterns = [
            /Clave de Rastreo:\s*([A-Za-z0-9]+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the destination bank from the receipt text.
     */
    destination_bank(text) {
        const patterns = [
            /Banco Destino:\s*([A-Z]+?)\s{2,}Nombre del Beneficiario:/i,
            /Banco Destino:\s*([A-Z]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Converts date from "09-Sep-2025" to "09/09/2025"
     */
    _convertDate(dateString) {
        if (!dateString) return null;

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

        const parts = dateString.split('-');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = months[parts[1]] || '01';
            const year = parts[2];
            return `${day}/${month}/${year}`;
        }
        return dateString;
    }
}

export default BanbajioSpeiProcessor;