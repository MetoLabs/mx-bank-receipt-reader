#!/usr/bin/env node

import BankReceiptReader from './src/bank-receipt-reader.js';
import fs from 'fs';
import path from 'path';

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        command: null,
        images: [],
        format: 'text'
    };

    // Check for command first
    if (args.length > 0 && !args[0].startsWith('-')) {
        options.command = args[0];
        args.shift();
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--image' || arg === '-i') {
            if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                options.images.push(args[++i]);
            }
        } else if (arg === '--format' || arg === '-f') {
            options.format = args[++i];
        } else if (arg === '--help' || arg === '-h') {
            showHelp();
            process.exit(0);
        } else if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            if (key === 'image' && value) options.images.push(value);
            if (key === 'format') options.format = value;
        } else if (!arg.startsWith('-')) {
            // Assume it's an image path if it doesn't start with -
            options.images.push(arg);
        }
    }

    // Handle the 'process' command
    if (options.command === 'process') {
        if (options.images.length === 0) {
            console.error('❌ Error: No image files specified for processing');
            showHelp();
            process.exit(1);
        }
    } else if (options.images.length === 0) {
        // Support for --image parameter without 'process' command
        console.error('❌ Error: No image files specified. Use --image parameter or the process command');
        showHelp();
        process.exit(1);
    }

    if (options.format !== 'json' && options.format !== 'text') {
        console.error('❌ Error: --format must be "json" or "text"');
        process.exit(1);
    }

    return options;
}

function showHelp() {
    console.log(`
Usage: bank-reader [command] [options]

Commands:
  process <files...>    Process one or more receipt images

Options:
  -i, --image <path>    Path to receipt image file
  -f, --format <format> Output format: json, text (default: text)
  -h, --help            Show this help

Examples:
  bank-reader process receipt.jpg
  bank-reader process receipt1.jpg receipt2.jpg
  bank-reader process /path/to/receipts/
  bank-reader --image receipt.jpg
  bank-reader -i receipt.jpg -f json
  bank-reader --image=receipt.jpg --format=json
    `);
}

function getFieldLabel(field) {
    const labels = {
        'account_id': '💳 Account',
        'amount': '💰 Amount',
        'reference': '📄 Reference',
        'transaction_id': '🆔 Transaction ID',
        'date': '📅 Date',
        'clabe': '🔢 CLABE'
    };
    return labels[field] || `📌 ${field.replace(/_/g, ' ').toUpperCase()}`;
}

/**
 * Processes a single image file and returns the result
 * 
 * @param {string} imagePath - Path to the image file
 * @param {BankReceiptReader} reader - Instance of BankReceiptReader
 * @returns {Promise<object|null>} - Processing result or null if failed
 */
async function processImage(imagePath, reader) {
    try {
        console.log(`🔍 Processing: ${imagePath}`);
        const result = await reader.readReceipt(imagePath);
        
        if (result === null) {
            console.log(`❌ Could not identify bank from receipt: ${imagePath}`);
            return null;
        }

        if (!result.success) {
            console.log(`❌ Error processing ${imagePath}: ${result.error}`);
            return null;
        }

        return result;
    } catch (error) {
        console.log(`❌ Error processing ${imagePath}: ${error.message}`);
        return null;
    }
}

/**
 * Checks if a path is a directory
 * 
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if path is a directory
 */
function isDirectory(filePath) {
    try {
        return fs.statSync(filePath).isDirectory();
    } catch (error) {
        return false;
    }
}

/**
 * Gets all image files from a directory
 * 
 * @param {string} dirPath - Path to directory
 * @returns {string[]} - Array of image file paths
 */
function getImagesFromDirectory(dirPath) {
    try {
        const files = fs.readdirSync(dirPath);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif'];
        
        return files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return imageExtensions.includes(ext);
            })
            .map(file => path.join(dirPath, file));
    } catch (error) {
        console.error(`❌ Error reading directory ${dirPath}: ${error.message}`);
        return [];
    }
}

/**
 * Displays the processing result
 * 
 * @param {object} result - Processing result
 * @param {string} format - Output format (json or text)
 */
function displayResult(result, format) {
    if (format === 'json') {
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.log('\n✅ Receipt processed successfully:');
        console.log(`🏦 Bank: ${result.bank}`);
        console.log(`📋 Type: ${result.type}`);

        for (const [key, value] of Object.entries(result.data)) {
            const label = getFieldLabel(key);
            console.log(`${label}: ${value}`);
        }
        console.log(''); // Add empty line for better readability
    }
}

async function main() {
    try {
        const options = parseArgs();
        const reader = new BankReceiptReader();
        let imagePaths = [];

        // Collect all image paths to process
        for (const path of options.images) {
            if (isDirectory(path)) {
                const dirImages = getImagesFromDirectory(path);
                if (dirImages.length === 0) {
                    console.log(`⚠️ No image files found in directory: ${path}`);
                }
                imagePaths = imagePaths.concat(dirImages);
            } else {
                imagePaths.push(path);
            }
        }

        if (imagePaths.length === 0) {
            console.error('❌ No valid image files to process');
            process.exit(1);
        }

        console.log(`🔍 Found ${imagePaths.length} image(s) to process\n`);
        
        // Process each image
        for (const imagePath of imagePaths) {
            const result = await processImage(imagePath, reader);
            if (result) {
                displayResult(result, options.format);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();