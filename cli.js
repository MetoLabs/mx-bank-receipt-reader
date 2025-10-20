#!/usr/bin/env node

import BankReceiptReader from './src/bank-receipt-reader.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        command: null,
        files: [],
        format: 'text'
    };

    if (args.length > 0 && !args[0].startsWith('-')) {
        options.command = args[0];
        args.shift();
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--file' || arg === '-f') {
            if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                options.files.push(args[++i]);
            }
        } else if (arg === '--format' || arg === '-o') {
            options.format = args[++i];
        } else if (arg === '--help' || arg === '-h') {
            showHelp();
            process.exit(0);
        } else if (!arg.startsWith('-')) {
            options.files.push(arg);
        }
    }

    if (options.files.length === 0) {
        console.error('❌ No files specified');
        showHelp();
        process.exit(1);
    }

    if (!['json', 'text'].includes(options.format)) {
        console.error('❌ Format must be "json" or "text"');
        process.exit(1);
    }

    return options;
}

function showHelp() {
    console.log(`
Usage: bank-reader [command] [options]

Commands:
  process <files...>      Process one or more receipt files (image or PDF)

Options:
  -f, --file <path>       Path to receipt file or directory
  -o, --format <format>   Output format: json, text (default: text)
  -h, --help              Show this help

Examples:
  bank-reader process receipt.jpg
  bank-reader process receipt1.jpg receipt2.pdf
  bank-reader -f receipts/ -o json
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

function isDirectory(filePath) {
    try {
        return fs.statSync(filePath).isDirectory();
    } catch {
        return false;
    }
}

function getFilesFromDirectory(dirPath) {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    try {
        const files = fs.readdirSync(dirPath);
        return files
            .filter(f => allowedExtensions.includes(path.extname(f).toLowerCase()))
            .map(f => path.join(dirPath, f));
    } catch (err) {
        console.error(`❌ Failed to read directory ${dirPath}: ${err.message}`);
        return [];
    }
}

function displayResult(result, format) {
    if (format === 'json') {
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.log('\n✅ Receipt processed successfully:');
        console.log(`🏦 Bank: ${result.bank}`);
        console.log(`📋 Type: ${result.type}`);
        for (const [key, value] of Object.entries(result.data)) {
            console.log(`${getFieldLabel(key)}: ${value}`);
        }
        console.log('');
    }
}

async function processFile(filePath, reader) {
    try {
        console.log(`🔍 Processing: ${filePath}`);
        const result = await reader.readReceipt(filePath);

        if (!result) {
            console.log(`❌ Could not identify bank from file: ${filePath}`);
            return null;
        }

        if (!result.success) {
            console.log(`❌ Error processing ${filePath}: ${result.error}`);
            return null;
        }

        return result;
    } catch (err) {
        console.log(`❌ Error processing ${filePath}: ${err.message}`);
        return null;
    }
}

async function main() {
    const options = parseArgs();
    const reader = new BankReceiptReader();

    let allFiles = [];

    for (const file of options.files) {
        if (isDirectory(file)) {
            const dirFiles = getFilesFromDirectory(file);
            if (dirFiles.length === 0) console.log(`⚠️ No files found in directory: ${file}`);
            allFiles = allFiles.concat(dirFiles);
        } else {
            allFiles.push(file);
        }
    }

    if (allFiles.length === 0) {
        console.error('❌ No valid files to process');
        process.exit(1);
    }

    console.log(`🔍 Found ${allFiles.length} file(s) to process\n`);

    for (const file of allFiles) {
        const result = await processFile(file, reader);
        if (result) displayResult(result, options.format);
    }
}

main();
