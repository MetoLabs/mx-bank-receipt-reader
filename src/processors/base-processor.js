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
            if (methodName !== 'constructor' && typeof this[methodName] === 'function') {
                const value = this[methodName](text);
                if (value !== null && value !== undefined) {
                    data[methodName] = value;
                }
            }
        }

        return data;
    }

    /**
     * Extracts data from text using an array of regex patterns.
     * Returns the first match found or null if no match is found.
     * 
     * @param {string} text - The text to extract data from
     * @param {RegExp[]} patterns - An array of regex patterns to match against
     * @returns {string|null} The first captured group from the first matching pattern, or null if no match
     * @private
     */
    _extractWithPatterns(text, patterns) {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        return null;
    }
}

export default BaseProcessor;