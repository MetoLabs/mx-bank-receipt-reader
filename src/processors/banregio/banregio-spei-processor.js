import BaseProcessor from '../base-processor.js';

class BanregioSpeiProcessor extends BaseProcessor {
    /**
     * Extracts the account ID from the receipt text.
     */
    account_id(text) {
        const patterns = [
            /Cuenta Origen[^]*?-\s*(\*?\d+)/i,
            /ASESORES[^]*?-\s*(\*?\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the transaction amount from the receipt text.
     */
    amount(text) {
        const patterns = [
            /\$([\d,]+\.?\d{2})/i,
            /Cantidad a Transferir[^]*?\$([\d,]+\.?\d{2})/i,
        ];
        const amount = this._extractWithPatterns(text, patterns);
        return amount ? parseFloat(amount.replace(/[^\d.]/g, '')) : null;
    }

    /**
     * Extracts the reference number from the receipt text.
     */
    reference(text) {
        const patterns = [
            /Número de referencia\s*(\d+)/i,
            /Transferencia\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the operation date from the receipt text.
     */
    operation_date(text) {
        const patterns = [
            /Fecha de operación SPEI\s*(\d{1,2}\s+\w+\s+\d{4})/i,
            /Recibo de la transferencia\s*(\d{1,2}\s+\w+\s+\d{4})/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? this._convertDate(result) : null;
    }

    /**
     * Extracts the destination account from the receipt text.
     */
    destination_account(text) {
        const patterns = [
            /Cuenta Destino[^]*?-\s*(\d+)/i,
            /MATERIALES[^]*?-\s*(\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the beneficiary name from the receipt text.
     */
    beneficiary_name(text) {
        const patterns = [
            /Cuenta Destino[^]*?-\s*([A-Z\s\.]+?)\s+\d+/i,
            /MATERIALES[^]*?SA DE CV/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the concept from the receipt text.
     */
    concept(text) {
        const patterns = [
            /Concepto de pago\s*([^\n\r]+?)\s{2,}\w+/i,
            /Concepto de pago\s*([^\n\r]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the tracking key from the receipt text.
     */
    tracking_key(text) {
        const patterns = [
            /Tu clave de rastreo\s*([A-Za-z0-9]+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Converts date from "10 octubre 2025" to "10/10/2025"
     */
    _convertDate(dateString) {
        if (!dateString) return null;

        const months = {
            'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
            'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
            'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
        };

        const parts = dateString.toLowerCase().split(/\s+/);
        if (parts.length >= 3) {
            const day = parts[0].padStart(2, '0');
            const month = months[parts[1]] || '01';
            const year = parts[2];
            return `${day}/${month}/${year}`;
        }
        return dateString;
    }
}

export default BanregioSpeiProcessor;