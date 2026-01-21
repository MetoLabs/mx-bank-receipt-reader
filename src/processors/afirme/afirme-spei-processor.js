import BaseProcessor from '../base-processor.js';

class AfirmeSpeiProcessor extends BaseProcessor {
    /**
     * Extracts the account ID from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The account ID or null if not found
     */
    account_id(text) {
        const patterns = [
            /Cuenta origen\s*[A-Za-z0-9\s\-]+?\(\*\*\*\*(\d+)\)/i,
            /Cuenta origen[^\(]*\(\*\*\*\*(\d+)\)/i,
            /\(\*\*\*\*(\d+)\)/
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        return null;
    }

    /**
     * Extracts the transaction amount from the receipt text.
     *
     * @param {string} text - The receipt text to extract from
     * @returns {number|null} The transaction amount as a number or null if not found
     */
    amount(text) {
        const patterns = [
            /Importe de traspaso\s*\$\s*([0-9,]+\.\d{2})\s*MXP/i,
            /Importe.*\$\s*([0-9,]+\.\d{2})\s*MXP/i,
            /\$\s*([0-9,]+\.\d{2})\s*MXP\./i,
            /Importe.*\$([0-9,]+\.\d{2})/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const amountString = match[1].replace(/,/g, '');
                const amount = parseFloat(amountString);
                return !isNaN(amount) ? amount : null;
            }
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
            /Referencia SPE\s*(\d+)/i,
            /Referencia SPE\s*(\d{9})/i,
            /Referencia.*?(\d{9})/i,
            /Referencia numérica\s*(\d+)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        return null;
    }

    /**
     * Extracts the tracking key (clave de rastreo)
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The tracking key or null if not found
     */
    tracking_key(text) {
        const patterns = [
            /Clave de rastreo\s*(\d+)/i,
            /Clave.*rastreo\s*(\d{25,30})/i,
            /Exitosa\s*(\d+)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        return null;
    }

    /**
     * Extracts the transaction date
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The transaction date or null if not found
     */
    date(text) {
        const patterns = [
            /Fecha:\s*(\d{2}\/\d{2}\/\d{2})/i,
            /Día:\s*(\d{2}\/\d{2}\/\d{2})/i,
            /Fecha.*?(\d{2}\/\d{2}\/\d{2})/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        return null;
    }

    /**
     * Extracts the beneficiary information (Cuenta destino)
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The beneficiary or null if not found
     */
    beneficiary(text) {
        const patterns = [
            /Cuenta destino\s*([A-Za-z0-9\s\-]+?)\s*\(\*\*\*\*\d+\)/i,
            /Cuenta destino\s*([^\(]+)/i,
            /SEPSA COMISIONES[^\(]*\(\*\*\*\*(\d+)\)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                let beneficiary = match[1].trim();

                beneficiary = beneficiary
                    .replace(/\s+/g, ' ')
                    .replace(/\s*-\s*\(\*\*\*\*\d+\)\s*-\s*[A-Z]+$/, '')
                    .replace(/\s*-\s*$/, '')
                    .trim();

                return beneficiary || null;
            }
        }
        return null;
    }

    /**
     * Extracts the payment concept
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The concept or null if not found
     */
    concept(text) {
        const patterns = [
            /Concepto del pago\s*([A-Za-z0-9\s]+)(?=Comisión|Referencia|$)/i,
            /Concepto del pago\s*([^\n]+)/i,
            /PAGO DE SERVICIO/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                if (pattern.toString().includes('PAGO DE SERVICIO')) {
                    return 'PAGO DE SERVICIO';
                }

                const conceptText = match[1].trim();

                if (conceptText.includes('PAGO DE SERVICIO')) {
                    return 'PAGO DE SERVICIO';
                }
                return conceptText;
            }
        }
        return null;
    }

    /**
     * Extracts the transaction status
     *
     * @param {string} text - The receipt text to extract from
     * @returns {string|null} The status or null if not found
     */
    status(text) {
        if (/Exitosa/i.test(text)) {
            return 'Exitosa';
        }
        if (/Fallida/i.test(text)) {
            return 'Fallida';
        }
        if (/Rechazada/i.test(text)) {
            return 'Rechazada';
        }
        if (/Pendiente/i.test(text)) {
            return 'Pendiente';
        }
        return null;
    }
}

export default AfirmeSpeiProcessor;