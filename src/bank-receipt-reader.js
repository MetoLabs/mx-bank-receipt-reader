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
    constructor() {
        this.processors = this._initializeProcessors();
        this.pdfjs = null;
        this.pdfWorkerSrc = null;
    }

    /**
     * Set pdfjs library instance (from user)
     * @param {any} pdfjsLib
     */
    setPdfJs(pdfjsLib) {
        this.pdfjs = pdfjsLib;
    }

    /**
     * Set worker source URL (from user)
     * @param {string} workerSrc
     */
    setPdfWorkerSrc(workerSrc) {
        this.pdfWorkerSrc = workerSrc;
        if (this.pdfjs) {
            this.pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        }
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
        if (!this.pdfjs) {
            throw new Error('pdfjsLib not set. Call setPdfJs() first.');
        }
        if (!this.pdfWorkerSrc) {
            throw new Error('PDF worker not set. Call setPdfWorkerSrc() first.');
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await this.pdfjs.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' ') + '\n';
        }

        pdfDoc.destroy?.();
        return fullText.trim();
    }

    /**
     * Extracts images from PDF and performs OCR on them
     * @param {File} file - PDF file to extract images from
     * @returns {Promise<string>} Extracted text from all images in the PDF
     */
    async extractTextFromPdfWithImages(file) {
        if (!this.pdfjs) {
            throw new Error('pdfjsLib not set. Call setPdfJs() first.');
        }
        if (!this.pdfWorkerSrc) {
            throw new Error('PDF worker not set. Call setPdfWorkerSrc() first.');
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await this.pdfjs.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');

            if (pageText.trim().length > 0) {
                fullText += pageText + '\n';
            }
        }

        if (fullText.trim().length < 100) {
            const imageText = await this.extractTextFromPdfImages(pdfDoc);
            fullText += imageText;
        }

        pdfDoc.destroy?.();
        return fullText.trim();
    }

    /**
     * Extracts images from PDF pages and performs OCR
     * @param {any} pdfDoc - PDF document object
     * @returns {Promise<string>} Extracted text from all images
     */
    async extractTextFromPdfImages(pdfDoc) {
        let extractedText = '';
        const worker = await createWorker('spa+eng', 3);

        try {
            await worker.setParameters({
                tessedit_pageseg_mode: '11',
            });

            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, 'image/png', 1.0);
                });

                if (blob) {
                    const result = await worker.recognize(blob);
                    extractedText += result.data.text + '\n';
                }

                page.cleanup();
            }
        } finally {
            await worker.terminate();
        }

        return extractedText;
    }

    /**
     * Enhanced extractText method that handles both text and image-based PDFs
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
            return this.extractTextFromPdfWithImages(file);
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
        console.log(text);
        const bankPatterns = [
            {
                name: 'afirme_spei',
                patterns: [
                    /el banco de hoy/i,
                    /banca afirme/i,
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
                name: 'banbajio_spei',
                patterns: [
                    /Banco del Bajío S.A./i,
                    /BajioNet/i,
                    /RFC: BBA940707IE1/i,
                ],
            },
            {
                name: 'banorte_spei',
                patterns: [
                    /([A-Z0-9]{4}APR[12]\d+)/,
                    /Transferencias \/ Otros Bancos Nacional - SPEI \(Mismo día\)/i,
                ],
            },
            {
                name: 'banorte_third_party',
                patterns: [
                    /Transferencias a Cuentas de Terceros Banorte/i,
                    /ID Tercero\s*AFB/i,

                ],
            },
            {
                name: 'scotiabank_spei',
                patterns: [
                    /Scotiabank Inverlat S.A./i,
                    /Impresión de Comprobante de Traspasos Otros Bancos/i,
                ],
            },
            {
                name: 'santander_spei',
                patterns: [
                    /Clave de Rastreo:\s*[A-Z0-9]{20,40}/i,
                    /Cuenta CLABE Beneficiario:\s*\d{18}/i,
                    /Banco Participante:/i,
                ],
            },
            {
                name: 'santander_third_party',
                patterns: [
                    /Transferencias a cuentas Santander/i,
                    /Traspaso entre cuentas Santander/i,
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
            {
                name: 'banregio_spei',
                patterns: [
                    /(\d{3}-\d{2}\/\d{2}\/\d{4}\/\d{2}-[A-Z0-9]+)/,
                    /Tipo de Transferencia\s*Mismo día hábil \(SPEI\)/i,
                    /Fecha de operación SPEI/i,
                ],
            },
            {
                name: 'banregio_third_party',
                patterns: [
                    /Cuenta Origen Cuenta Destino Cantidad a Transferir Descripcion/i,
                    /Verificador\s*[A-Z]/i,
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