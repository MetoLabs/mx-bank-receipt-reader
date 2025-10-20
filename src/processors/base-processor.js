class BaseProcessor {
    /**
     * Extracts data from text using all available methods in the processor.
     * 
     * @param {string} text - The text to extract data from
     * @param {boolean} skipEmptyLines - Whether to skip empty lines in the text
     * @returns {object} An object containing all extracted data
     */
    extract(text, skipEmptyLines = true) {
        if (skipEmptyLines) {
            text = text.split('\n')
                .filter(line => line.trim() !== '')
                .join('\n');
        }

        const data = {};

        const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this));

        for (const methodName of methodNames) {
            if (methodName !== 'constructor' && typeof this[methodName] === 'function' && !methodName.startsWith('_')) {
                const value = this[methodName](text);
                if (value !== null && value !== undefined) {
                    data[methodName] = value;
                }
            }
        }

        return data;
    }

    /**
     * Extracts text using multiple patterns
     * @param {string} text - Text to search in
     * @param {Array} patterns - Array of regex patterns
     * @returns {string|null} Extracted text or null if not found
     */
    _extractWithPatterns(text, patterns) {
        if (!text || !patterns) return null;

        const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        for (const pattern of patterns) {
            try {
                const match = normalizedText.match(pattern);
                if (match && match[1]) {
                    let result = match[1].trim();

                    if (result.includes('\n')) {
                        result = result.split('\n')[0].trim();
                    }

                    return result || null;
                }
            } catch (error) {
                console.warn('Error applying pattern:', pattern, error);
                continue;
            }
        }
        return null;
    }
}

export default BaseProcessor;