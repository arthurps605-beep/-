#!/usr/bin/env node
/**
 * Предмети: assets/subjekt/   Баки: assets/subjekt/bins/
 * node scripts/validate-assets.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gamePath = path.join(root, 'game.js');
const subjekt = path.join(root, 'assets', 'subjekt');
const binsDir = path.join(subjekt, 'bins');

const game = fs.readFileSync(gamePath, 'utf8');
const itemExpected = new Set();
const re = /imageFile:\s*'([^']+)'/g;
let m;
while ((m = re.exec(game))) {
    itemExpected.add(m[1]);
}

const binExpected = new Set();
const mapBlock = game.match(/function binImageFilenameFor\(system, letter\) \{[\s\S]*?\n    \}/);
if (mapBlock) {
    const mm = mapBlock[0].matchAll(/'([a-z0-9_]+\.png)'/gi);
    for (const x of mm) {
        binExpected.add(x[1]);
    }
}

function listFiles(dir) {
    if (!fs.existsSync(dir)) return new Set();
    return new Set(
        fs.readdirSync(dir).filter((f) => {
            try {
                return !fs.statSync(path.join(dir, f)).isDirectory();
            } catch (e) {
                return false;
            }
        })
    );
}

const onItemDisk = listFiles(subjekt);
const onBinDisk = listFiles(binsDir);

const missingItems = [...itemExpected].filter((f) => !onItemDisk.has(f)).sort();
const missingBins = [...binExpected].filter((f) => !onBinDisk.has(f)).sort();

console.log('=== Перевірка assets/subjekt та bins ===\n');
console.log('Файлів у assets/subjekt:', onItemDisk.size);
console.log('Файлів у assets/subjekt/bins:', onBinDisk.size);

console.log('\n--- Немає файлу предмета ---');
if (missingItems.length === 0) console.log('(немає)');
else missingItems.forEach((f) => console.log('  •', f));

console.log('\n--- Немає файлу бака ---');
if (missingBins.length === 0) console.log('(немає)');
else missingBins.forEach((f) => console.log('  •', f));

process.exit(missingItems.length || missingBins.length ? 1 : 0);
