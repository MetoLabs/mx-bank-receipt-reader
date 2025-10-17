# Mexican Bank Receipt Reader

A JavaScript library for extracting structured data from Mexican bank receipts using OCR. Works in both Node.js and browser environments.

## Features

- Extract data from bank receipt images (SPEI transfers, third-party transfers)
- Automatic bank detection
- Works in both Node.js (CLI) and browser environments
- Supports multiple Mexican banks:
  - BBVA
  - Banorte
  - Santander
  - HSBC
  - Scotiabank
  - Afirme
  - BanBajio
  - Banregio

## Installation

### NPM

```bash
npm install mx-bank-receipt-reader
```

### Yarn

```bash
yarn add mx-bank-receipt-reader
```

## CLI Usage

The package includes a command-line interface for processing receipt images:

### Using the command syntax (recommended)

```bash
# Process a single receipt image
bank-reader process /path/to/receipt.jpg

# Process multiple receipt images
bank-reader process /path/to/receipt1.jpg /path/to/receipt2.jpg

# Process all images in a directory
bank-reader process /path/to/receipts/

# Process with JSON output format
bank-reader process /path/to/receipt.jpg --format json
```

### Using the parameter syntax

```bash
# Process a receipt image
bank-reader --image /path/to/receipt.jpg

# Process with JSON output format
bank-reader --image /path/to/receipt.jpg --format json

# Alternative syntax
bank-reader -i /path/to/receipt.jpg -f json
```

### CLI Options

```
Commands:
  process <files...>    Process one or more receipt images

Options:
  -i, --image <path>    Path to receipt image file
  -f, --format <format> Output format: json, text (default: text)
  -h, --help            Show this help
```

## Browser Usage

### Using ES Modules

```javascript
import BankReceiptReader from 'mx-bank-receipt-reader';

const reader = new BankReceiptReader();

// Process an image (File, Blob, or HTMLImageElement)
const fileInput = document.getElementById('receipt-image');
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  
  try {
    const result = await reader.readReceipt(file);
    
    if (result && result.success) {
      console.log('Bank:', result.bank);
      console.log('Type:', result.type);
      console.log('Data:', result.data);
    } else {
      console.error('Could not identify bank or extract data');
    }
  } catch (error) {
    console.error('Error processing receipt:', error);
  }
});
```

### Using Script Tag

```html
<script src="node_modules/mx-bank-receipt-reader/dist/bank-receipt-reader.browser.js"></script>
<script>
  const reader = new BankReceiptReader();
  
  // Process an image (File, Blob, or HTMLImageElement)
  const fileInput = document.getElementById('receipt-image');
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    
    try {
      const result = await reader.readReceipt(file);
      
      if (result && result.success) {
        console.log('Bank:', result.bank);
        console.log('Type:', result.type);
        console.log('Data:', result.data);
      } else {
        console.error('Could not identify bank or extract data');
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
    }
  });
</script>
```

## API Reference

### `BankReceiptReader`

The main class for processing bank receipts.

#### Constructor

```javascript
const reader = new BankReceiptReader();
```

#### Methods

##### `readReceipt(imageInput)`

Processes a receipt image and extracts structured data.

- **Parameters:**
  - `imageInput` (Browser: File, Blob, HTMLImageElement | Node.js: string) - The receipt image to process
- **Returns:** Promise<Object> - A promise that resolves to an object with the following properties:
  - `success` (boolean) - Whether the processing was successful
  - `bank` (string) - The identified bank (e.g., 'bbva', 'santander')
  - `type` (string) - The receipt type (e.g., 'spei', 'third_party')
  - `data` (Object) - The extracted data, which may include:
    - `account_id` (string) - The account ID
    - `amount` (number) - The transaction amount
    - `reference` (string) - The reference number

##### `extractText(imageInput)`

Extracts text from an image using OCR.

- **Parameters:**
  - `imageInput` (Browser: File, Blob, HTMLImageElement | Node.js: string) - The image to process
- **Returns:** Promise<string> - A promise that resolves to the extracted text

##### `identifyBank(text)`

Identifies the bank and receipt type from OCR text.

- **Parameters:**
  - `text` (string) - The OCR text to analyze
- **Returns:** Object|null - An object with bank information or null if no bank was identified

## Supported Banks and Receipt Types

| Bank | SPEI Transfers | Third-Party Transfers |
|------|----------------|------------------------|
| BBVA | ✅ | ✅ |
| Banorte | ✅ | ✅ |
| Santander | ✅ | ✅ |
| HSBC | ✅ | ❌ |
| Scotiabank | ✅ | ❌ |
| Afirme | ✅ | ❌ |
| BanBajio | ✅ | ❌ |
| Banregio | ✅ | ✅ |

## Requirements

- Node.js 14+ (for CLI usage)
- Modern browser with ES6 support (for browser usage)

## License

MIT