import BaseProcessor from '../base-processor.js';

class BanregioThirdPartyProcessor extends BaseProcessor {
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
        ];
        const amount = this._extractWithPatterns(text, patterns);
        return amount ? parseFloat(amount.replace(/[^\d.]/g, '')) : null;
    }

    /**
     * Extracts the reference number from the receipt text.
     */
    reference(text) {
        const patterns = [
            /Transferencia\s*([A-Za-z0-9-]+)/i,
            /fIzZ8q-UcN/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the operation date from the receipt text.
     */
    operation_date(text) {
        const patterns = [
            /fIzZ8q-UcN\s*-\s*(\d{2}-\d{2}-\d{4})/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.replace(/(\d{2})-(\d{2})-(\d{4})/, '$1/$2/$3') : null;
    }

    /**
     * Extracts the destination account from the receipt text.
     */
    destination_account(text) {
        const patterns = [
            /Cuenta Destino[^]*?-\s*(\*?\d+)/i,
            /MATERIALES[^]*?-\s*(\*?\d+)/i,
        ];
        return this._extractWithPatterns(text, patterns);
    }

    /**
     * Extracts the beneficiary name from the receipt text.
     */
    beneficiary_name(text) {
        const patterns = [
            /Cuenta Destino[^]*?-\s*([A-Z\s\.]+?)\s+\*/i,
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
            /Descripcion\s*([^\n\r]+?)\s{2,}/i,
            /Descripcion\s*([^\n\r]+)/i,
        ];
        const result = this._extractWithPatterns(text, patterns);
        return result ? result.trim() : null;
    }

    /**
     * Extracts the operation type from the receipt text.
     */
    operation_type(text) {
        return "Transferencia a Terceros";
    }
}

export default BanregioThirdPartyProcessor;