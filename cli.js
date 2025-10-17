#!/usr/bin/env node

import BankReceiptReader from './src/bank-receipt-reader.js';

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        image: null,
        format: 'text'
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--image' || arg === '-i') {
            options.image = args[++i];
        } else if (arg === '--format' || arg === '-f') {
            options.format = args[++i];
        } else if (arg === '--help' || arg === '-h') {
            showHelp();
            process.exit(0);
        } else if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            if (key === 'image') options.image = value;
            if (key === 'format') options.format = value;
        }
    }

    if (!options.image) {
        console.error('❌ Error: --image parameter is required');
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
Usage: bank-reader [options]

Options:
  -i, --image <path>    Path to receipt image file (required)
  -f, --format <format> Output format: json, text (default: text)
  -h, --help           Show this help

Examples:
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

async function main() {
    try {
        const options = parseArgs();

        console.log('🔍 Reading bank receipt...');

        const reader = new BankReceiptReader();
        const result = await reader.readReceipt(options.image);

        if (result === null) {
            console.log('❌ Could not identify bank from receipt');
            process.exit(1);
        }

        if (!result.success) {
            throw new Error(result.error);
        }

        if (options.format === 'json') {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log('\n✅ Receipt processed successfully:');
            console.log(`🏦 Bank: ${result.bank}`);
            console.log(`📋 Type: ${result.type}`);

            for (const [key, value] of Object.entries(result.data)) {
                const label = getFieldLabel(key);
                console.log(`${label}: ${value}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();