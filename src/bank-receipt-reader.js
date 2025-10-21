import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

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
    constructor() {
        this.processors = this._initializeProcessors();
    }

    /**
     * Initializes all available bank processors
     * @private
     * @returns {Object} Object containing all initialized processors
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
     * Extracts text from an image using Tesseract.js
     * @param {string|File|Blob} imageInput - Image file or URL to process
     * @returns {Promise<string>} Extracted text from the image
     */
    async extractTextFromImage(imageInput) {
        const worker = await createWorker('spa+eng', 3);
        try {
            await worker.setParameters({ tessedit_pageseg_mode: '11' });
            const result = await worker.recognize(imageInput);
            return result.data.text.trim();
        } finally {
            await worker.terminate();
        }
    }

    /**
     * Extracts text from a PDF using pdfjs-dist (browser-only)
     * @param {File} file - PDF file to extract text from
     * @returns {Promise<string>} Extracted text from the PDF
     */
    async extractTextFromPdf(file) {
        if (typeof window === 'undefined') {
            throw new Error('PDF processing is only supported in browser environment');
        }

        const arrayBuffer = await file.arrayBuffer();

        const workerBlob = new Blob(
            [`importScripts('https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.js');`],
            { type: 'application/javascript' }
        );
        const workerUrl = URL.createObjectURL(workerBlob);
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

        try {
            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = '';

            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
                page.cleanup?.();
            }

            pdfDoc.destroy?.();
            URL.revokeObjectURL(workerUrl);
            return fullText.trim();
        } catch (error) {
            throw new Error(`Failed to extract PDF text: ${error.message}`);
        }
    }

    /**
     * Detects the input type and extracts text accordingly
     * @param {string|File|Blob} file - Input file (image URL, File, or Blob)
     * @returns {Promise<string>} Extracted text from the input
     * @throws {Error} When input type is invalid or unsupported
     */
    async extractText(file) {
        if (typeof file === 'string') {
            return this.extractTextFromImage(file);
        }

        if (!(file instanceof File || file instanceof Blob)) {
            throw new Error('Invalid input type.');
        }

        const mimeType = file.type.toLowerCase();

        if (mimeType === 'application/pdf') {
            return this.extractTextFromPdf(file);
        }

        if (mimeType === 'image/jpeg' || mimeType === 'image/png') {
            return this.extractTextFromImage(file);
        }

        throw new Error('Unsupported file type. Only JPG, PNG, and PDF are accepted.');
    }

    /**
     * Identifies the bank and transaction type from extracted text
     * @param {string} text - Text extracted from bank receipt
     * @returns {Object|null} Object containing bank name, type and processor, or null if not identified
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
                patterns: [
                    /Banco del Bajío S.A./i,
                    /BajioNet/i,
                    /RFC: BBA940707IE1/i,
                    /Transferencia Interbancaria SPEI/i,
                ],
            },
            {
                name: 'banorte_spei',
                patterns: [
                    /Transferencias \/ Otros Bancos Nacional - SPEI \(Mismo día\)/i,
                    /Banco Destino\s*[A-Z]/i,
                    /Clave de Rastreo\s*\d{20,}/i,
                ],
            },
            {
                name: 'banorte_third_party',
                patterns: [
                    /Transferencias a Cuentas de Terceros Banorte/i,
                    /Titular de la Cuenta/i,
                    /ID Tercero\s*AFB/i,
                ],
            },
            {
                name: 'banregio_spei',
                patterns: [
                    /Tipo de Transferencia\s*Mismo día hábil \(SPEI\)/i,
                    /Fecha de operación SPEI/i,
                    /Banco\s*SANTANDER/i,
                    /Clave de rastreo/i,
                ],
            },
            {
                name: 'banregio_third_party',
                patterns: [
                    /Cuenta Origen Cuenta Destino Cantidad a Transferir Descripcion/i,
                    /Banregio/i,
                    /Verificador\s*[A-Z]/i,
                ],
            },
            {
                name: 'bbva_spei',
                patterns: [
                    /BNET[0-9A-Za-z]{20}/i
                ],
            },
            {
                name: 'bbva_third_party',
                patterns: [
                    /trasp ctas bbva/i,
                ],
            },
            {
                name: 'scotiabank_spei',
                patterns: [
                    /Scotiabank Inverlat S.A./i,
                    /Impresión de Comprobante de Traspasos Otros Bancos/i,
                    /Clave de Rastreo\s*\d{25,}/i
                ],
            },
            {
                name: 'santander_third_party',
                patterns: [
                    /Tipo de Operación:\s*Consulta de Movimientos/i,
                    /Descripción:\s*CGO TRANS ELEC/i,
                ],
            },
            {
                name: 'santander_spei',
                patterns: [
                    /Tipo de Operación:\s*TRANSFERENCIA INTERBANCARIA/i,
                    /Estado:\s*ENVIADA/i,
                    /Cuenta Cargo:\s*\d+\s*-\s*[A-Z]/i,
                ],
            },
            {
                name: 'hsbc_spei',
                patterns: [
                    /HSBC\s+Mexico/i,
                    /Referencia\s+de\s+cliente\s*\d+/i,
                    /Clave\s+de\s+rastreo\s*HSBC/i,
                    /Narrativa\s+adicional\s*CGO\s+SPEI/i,
                    /Nombre\s+del\s+banco\s*HSBC/i
                ],
            },
        ];

        for (const bank of bankPatterns) {
            for (const pattern of bank.patterns) {
                if (pattern.test(text)) {
                    const [name, ...typeParts] = bank.name.split('_');
                    const type = typeParts.join('_');
                    return { name, type, processor: this.processors[bank.name] };
                }
            }
        }

        return null;
    }

    /**
     * Main method to read and process bank receipts
     * @param {string|File|Blob} file - Bank receipt file (image or PDF)
     * @returns {Promise<Object>} Processing result with bank information and extracted data
     */
    async readReceipt(file) {
        try {
            const text = await this.extractText(file);
            console.log(text);
            const bankInfo = this.identifyBank(text);

            if (!bankInfo) return { success: false, error: 'Unknown bank type' };

            const extractedData = bankInfo.processor.extract(text);

            return {
                success: true,
                bank: bankInfo.name,
                type: bankInfo.type,
                data: extractedData,
            };
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    }
}

export default BankReceiptReader;