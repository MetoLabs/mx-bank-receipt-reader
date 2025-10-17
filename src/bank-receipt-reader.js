// Use a more compatible approach for environment detection
const isBrowser = typeof window !== 'undefined';

// Import Node.js modules - these will be marked as external in Rollup config
import path from 'path';
import { fileURLToPath } from 'url';
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
     * Creates a new BankReceiptReader instance.
     * Detects the runtime environment and initializes the bank processors registry.
     */
    constructor() {
        this.isBrowser = isBrowser;
        this.processors = this._initializeProcessors();

        if (!this.isBrowser) {
            this._setupModelsPath();
        }
    }

    /**
     * Setup the models path (Node.js only).
     *
     * @private
     */
    _setupModelsPath() {
        if (!isBrowser && typeof process !== 'undefined' && process.cwd) {
            try {
                // In Node.js environment, set up the models path
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                this.modelsPath = process.cwd();
            } catch (error) {
                console.warn('Could not set up models path:', error);
            }
        }
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
     * Creates worker options with langPath configuration for CLI.
     *
     * @returns {object} Worker options
     * @private
     */
    _getWorkerOptions() {
        const options = {};

        if (!this.isBrowser && this.modelsPath) {
            options.langPath = this.modelsPath;
        }

        return options;
    }

    /**
     * Runs OCR, identifies the bank, and extracts structured data from the receipt image.
     * - In browsers, pass an image-like input supported by Tesseract.js (e.g., File, Blob, HTMLImageElement).
     * - In CLI/Node, pass a filesystem path to the image.
     *
     * Returns:
     * - ReadReceiptSuccess on success,
     * - ReadReceiptFailure on error,
     * - null when the bank cannot be identified from the OCR text.
     *
     * @param {BrowserImageInput|string} imageInput Browser image input or a file path (CLI/Node).
     * @returns {Promise<ReadReceiptResult|null>}
     */
    async readReceipt(imageInput) {
        try {
            const text = await this.extractText(imageInput);
            const bankInfo = this.identifyBank(text);

            if (!bankInfo) {
                return null;
            }

            const extractedData = bankInfo.processor.extract(text);

            return {
                success: true,
                bank: bankInfo.name,
                type: bankInfo.type,
                data: extractedData
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Performs OCR using Tesseract.js with optimized settings for bank receipts.
     *
     * @param {BrowserImageInput|string} imageInput Image input for the current environment.
     * @returns {Promise<string>} Recognized UTF-8 text from the image.
     */
    async extractText(imageInput) {
        const workerOptions = this._getWorkerOptions();
        const worker = await createWorker('spa+eng', 3, workerOptions);

        try {
            await worker.setParameters({
                tessedit_pageseg_mode: '11',
            });

            const result = await worker.recognize(imageInput);
            return result.data.text;

        } finally {
            await worker.terminate();
        }
    }

    /**
     * Attempts to identify the bank and receipt subtype from raw OCR text.
     *
     * @param {string} text Full OCR text retrieved by Tesseract.js.
     * @returns {object|null} Matching bank info or null if no patterns matched.
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
}

export default BankReceiptReader;