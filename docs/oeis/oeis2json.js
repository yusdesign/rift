// convert-oeis-to-json.js
const fs = require('fs');

// Read stripped file
const stripped = fs.readFileSync('stripped', 'utf-8');
const names = fs.readFileSync('names', 'utf-8');

// Parse sequences
const sequences = {};

// Parse stripped (sequence data)
const strippedLines = stripped.split('\n');
for (const line of strippedLines) {
    if (line.startsWith('#')) continue;
    const commaIndex = line.indexOf(',');
    if (commaIndex === -1) continue;
    
    const id = line.substring(0, commaIndex).trim();
    const valuesStr = line.substring(commaIndex + 1);
    const values = valuesStr.split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v));
    
    if (id && values.length) {
        sequences[id] = { data: values };
    }
}

// Parse names
const namesLines = names.split('\n');
for (const line of namesLines) {
    if (line.startsWith('#')) continue;
    const firstSpace = line.indexOf(' ');
    if (firstSpace === -1) continue;
    
    const id = line.substring(0, firstSpace).trim();
    const name = line.substring(firstSpace + 1).trim();
    
    if (sequences[id]) {
        sequences[id].name = name;
    }
}

// Create tiered JSON files for efficient loading
console.log(`Total sequences: ${Object.keys(sequences).length}`);

// Create index file (just IDs and names, small)
const index = {};
for (const [id, seq] of Object.entries(sequences)) {
    index[id] = {
        name: seq.name || '',
        terms: seq.data.length
    };
}
fs.writeFileSync('oeis_index.json', JSON.stringify(index, null, 2));

// Create chunked data files (10,000 sequences per chunk)
const allIds = Object.keys(sequences);
const CHUNK_SIZE = 10000;
for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
    const chunk = {};
    const chunkIds = allIds.slice(i, i + CHUNK_SIZE);
    for (const id of chunkIds) {
        chunk[id] = {
            data: sequences[id].data.slice(0, 500), // First 500 terms
            name: sequences[id].name
        };
    }
    const chunkNum = Math.floor(i / CHUNK_SIZE);
    fs.writeFileSync(`oeis_chunk_${chunkNum}.json`, JSON.stringify(chunk, null, 2));
    console.log(`Wrote chunk ${chunkNum}: ${Object.keys(chunk).length} sequences`);
}

console.log('Done! Place JSON files in docs/oeis/ directory');
