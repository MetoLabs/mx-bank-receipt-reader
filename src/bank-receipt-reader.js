import { createWorker } from 'tesseract.js';

import AfirmeSpeiProcessor from './processors/afirme/afirme-spei-processor.js';
import BanbajioSpeiProcessor from './processors/banbajio/banbajio-spei-processor.js';
import BanorteSpeiProcessor from './processors/banorte/banorte-spei-processor.js';
import BanorteThirdPartyProcessor from './processors/banorte/banorte-third-party-processor.js';
import BanregioSpeiProcessor from './processors/banregio/banregio-spei-processor.js';
import BanregioThirdPartyProcessor from './processors/banregio/banregio-third-party-processor.js';
import BbvaSpeiProcessor from './processors/bbva/bbva-spei-processor.js';
import BbvaThirdPartyProcessor from './processors/bbva/bbva-third-party-processor.js';
import HsbcSpeiProcessor from './processors/hsbc/hsbc-spei-processor.js';
import SantanderSpeiProcessor from './processors/santander/santander-spei-processor.js';
import SantanderThirdPartyProcessor from './processors/santander/santander-third-party-processor.js';
import ScotiabankSpeiProcessor from './processors/scotiabank/scotiabank-spei-processor.js';

class BankReceiptReader {
    /**
     * Creates a new BankReceiptReader instance for browser use.
     * Initializes the available processors registry.
     */
    constructor() {
        this.processors = this._initializeProcessors();
    }

    /**
     * Initializes and returns the registry of available bank processors.
     * Keys follow the "<bank>_<type>" convention, e.g., "bbva_spei".
     *
     * @returns {Record<string, BaseProcessor>}
     * @private
     */
    _initializeProcessors() {
        return {
            'afirme_spei': new AfirmeSpeiProcessor(),
            'banbajio_spei': new BanbajioSpeiProcessor(),
            'banorte_spei': new BanorteSpeiProcessor(),
            'banorte_third_party': new BanorteThirdPartyProcessor(),
            'banregio_spei': new BanregioSpeiProcessor(),
            'banregio_third_party': new BanregioThirdPartyProcessor(),
            'bbva_spei': new BbvaSpeiProcessor(),
            'bbva_third_party': new BbvaThirdPartyProcessor(),
            'hsbc_spei': new HsbcSpeiProcessor(),
            'santander_spei': new SantanderSpeiProcessor(),
            'santander_third_party': new SantanderThirdPartyProcessor(),
            'scotiabank_spei': new ScotiabankSpeiProcessor(),
        };
    }

    /**
     * Performs OCR using Tesseract.js with optimized settings for bank receipts.
     *
     * @param {File|Blob|HTMLImageElement|string} imageInput
     * @returns {Promise<string>} Recognized UTF-8 text.
     */
    async extractText(imageInput) {
        const worker = await createWorker('spa+eng', 3);

        try {
            await worker.setParameters({
                tessedit_pageseg_mode: '11',
            });

            const result = await worker.recognize(imageInput);
            return result.data.text.trim();

        } finally {
            await worker.terminate();
        }
    }

    /**
     * Identifies the bank and receipt subtype from OCR text.
     *
     * @param {string} text OCR text.
     * @returns {object|null}
     */
    identifyBank(text) {
        const bankPatterns = [
            {
                name: 'afirme_spei',
                patterns: [
                    /el banco de hoy/i,
                    /banca afirme/i,
                ],
            },
            {
                name: 'banbajio_spei',
                patterns: [],
            },
            {
                name: 'banorte_spei',
                patterns: [],
            },
            {
                name: 'banorte_third_party',
                patterns: [],
            },
            {
                name: 'banregio_spei',
                patterns: [],
            },
            {
                name: 'banregio_third_party',
                patterns: [],
            },
            {
                name: 'bbva_spei',
                patterns: [
                    /BNET[0-9A-Za-z]{20}/i,
                ],
            },
            {
                name: 'bbva_third_party',
                patterns: [
                    /transferencia a terceros/i
                ],
            },
            {
                name: 'hsbc_spei',
                patterns: [],
            },
            {
                name: 'santander_spei',
                patterns: [],
            },
            {
                name: 'santander_third_party',
                patterns: [],
            },
            {
                name: 'scotiabank_spei',
                patterns: [],
            },
        ];

        for (const bank of bankPatterns) {
            const [name, ...typeParts] = bank.name.split('_');
            const type = typeParts.join('_');

            for (const pattern of bank.patterns) {
                if (pattern.test(text)) {
                    return {
                        name,
                        type,
                        processor: this.processors[bank.name],
                    };
                }
            }
        }

        return null;
    }

    /**
     * Reads and processes a bank receipt from an image.
     *
     * @param {File|Blob|HTMLImageElement|string} imageInput
     * @returns {Promise<object|null>}
     */
    async readReceipt(imageInput) {
        try {
            const text = await this.extractText(imageInput);
            const bankInfo = this.identifyBank(text);

            if (!bankInfo) return null;

            const extractedData = bankInfo.processor.extract(text);

            return {
                success: true,
                bank: bankInfo.name,
                type: bankInfo.type,
                data: extractedData,
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default BankReceiptReader;
