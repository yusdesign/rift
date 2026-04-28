// docs/oeis-loader.js
// Shared OEIS loader for Resolutive Coinduction Explorer

class OEISLoader {
    constructor(basePath = 'oeis/') {
        this.basePath = basePath;
        this.index = null;
        this.manifest = null;
        this.chunkCache = new Map();
        this.sequenceCache = new Map();
        this.loadingPromises = new Map();
    }
    
    async decompressGzip(blob) {
        const ds = new DecompressionStream('gzip');
        const decompressedStream = blob.stream().pipeThrough(ds);
        const text = await new Response(decompressedStream).text();
        return text;
    }
    
    async loadIndex() {
        if (this.index) return this.index;
        
        try {
            const response = await fetch(this.basePath + 'index.json.gz');
            if (!response.ok) throw new Error('Index not found');
            const blob = await response.blob();
            const decompressed = await this.decompressGzip(blob);
            this.index = JSON.parse(decompressed);
            
            // Load manifest if exists
            try {
                const manifestResp = await fetch(this.basePath + 'oeis_manifest.json');
                if (manifestResp.ok) {
                    this.manifest = await manifestResp.json();
                }
            } catch(e) {}
            
            console.log(`OEIS index loaded: ${Object.keys(this.index).length} sequences`);
            return this.index;
        } catch(e) {
            console.warn('Could not load OEIS index, using fallback', e);
            this.index = this.getFallbackIndex();
            return this.index;
        }
    }
    
    getFallbackIndex() {
        // Minimal fallback for demo
        return {
            'A000027': { n: 'Natural numbers', t: 20 },
            'A000045': { n: 'Fibonacci numbers', t: 20 },
            'A000079': { n: 'Powers of 2', t: 16 },
            'A000142': { n: 'Factorials', t: 14 },
            'A000217': { n: 'Triangular numbers', t: 20 },
            'A000290': { n: 'Squares', t: 20 },
            'A000040': { n: 'Prime numbers', t: 20 },
            'A000034': { n: 'Periodic 1,2', t: 20 },
            'A000108': { n: 'Catalan numbers', t: 12 }
        };
    }
    
    getChunkForId(id) {
        if (!this.index) return null;
        const ids = Object.keys(this.index);
        const idx = ids.indexOf(id);
        if (idx === -1) return null;
        const chunkSize = this.manifest?.chunkSize || 5000;
        return Math.floor(idx / chunkSize);
    }
    
    async loadChunk(chunkNum) {
        if (this.chunkCache.has(chunkNum)) return this.chunkCache.get(chunkNum);
        
        if (this.loadingPromises.has(chunkNum)) {
            return this.loadingPromises.get(chunkNum);
        }
        
        const promise = (async () => {
            try {
                const response = await fetch(`${this.basePath}oeis_chunks/chunk_${chunkNum}.json.gz`);
                if (!response.ok) throw new Error(`Chunk ${chunkNum} not found`);
                const blob = await response.blob();
                const decompressed = await this.decompressGzip(blob);
                const chunk = JSON.parse(decompressed);
                this.chunkCache.set(chunkNum, chunk);
                return chunk;
            } catch(e) {
                console.warn(`Failed to load chunk ${chunkNum}:`, e);
                return null;
            }
        })();
        
        this.loadingPromises.set(chunkNum, promise);
        return promise;
    }
    
    async loadSequence(id) {
        const normId = id.toUpperCase();
        
        // Check cache
        if (this.sequenceCache.has(normId)) {
            return this.sequenceCache.get(normId);
        }
        
        // Check if in index
        await this.loadIndex();
        if (!this.index[normId]) {
            return this.getFallbackSequence(normId);
        }
        
        // Load from chunk
        const chunkNum = this.getChunkForId(normId);
        if (chunkNum !== null) {
            const chunk = await this.loadChunk(chunkNum);
            if (chunk && chunk[normId]) {
                const seq = {
                    id: normId,
                    name: chunk[normId].n || this.index[normId]?.n || normId,
                    data: chunk[normId].d || chunk[normId].data,
                    description: chunk[normId].desc || ''
                };
                this.sequenceCache.set(normId, seq);
                return seq;
            }
        }
        
        return this.getFallbackSequence(normId);
    }
    
    getFallbackSequence(id) {
        const fallbacks = {
            'A000027': { data: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], name: 'Natural numbers' },
            'A001477': { data: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19], name: 'Nonnegative integers' },
            'A000045': { data: [0,1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181], name: 'Fibonacci numbers' },
            'A000079': { data: [1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768], name: 'Powers of 2' },
            'A000142': { data: [1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800], name: 'Factorials' },
            'A000217': { data: [0,1,3,6,10,15,21,28,36,45,55,66,78,91,105,120,136,153,171,190], name: 'Triangular numbers' },
            'A000290': { data: [0,1,4,9,16,25,36,49,64,81,100,121,144,169,196,225,256,289,324,361], name: 'Squares' },
            'A000040': { data: [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71], name: 'Prime numbers' },
            'A000034': { data: [1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2], name: 'Periodic 1,2' },
            'A000108': { data: [1,1,2,5,14,42,132,429,1430,4862,16796,58786], name: 'Catalan numbers' }
        };
        
        if (fallbacks[id]) {
            return { id, ...fallbacks[id] };
        }
        return { id, data: [1,2,3,4,5], name: id };
    }
    
    async search(query, maxResults = 20) {
        await this.loadIndex();
        const q = query.toUpperCase();
        const results = [];
        
        for (const [id, info] of Object.entries(this.index)) {
            if (id.includes(q) || (info.n && info.n.toUpperCase().includes(q))) {
                results.push({
                    id: id,
                    name: info.n || id,
                    terms: info.t || 0
                });
                if (results.length >= maxResults) break;
            }
        }
        
        return results;
    }
    
    async getRandomSequence() {
        await this.loadIndex();
        const ids = Object.keys(this.index);
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        return this.loadSequence(randomId);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OEISLoader };
}
