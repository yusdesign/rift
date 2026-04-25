// Shared OEIS Loader for both index.html and guardo.html
class OEISLoader {
    constructor(basePath = 'oeis/') {
        this.basePath = basePath;
        this.index = null;
        this.manifest = null;
        this.chunkCache = new Map();
    }
    
    async loadIndex() {
        try {
            // Fetch and decompress gzipped index
            const response = await fetch(`${this.basePath}index.json.gz`);
            const blob = await response.blob();
            const decompressed = await this.decompressGzip(blob);
            this.index = JSON.parse(decompressed);
            
            // Load manifest
            const manifestResp = await fetch(`${this.basePath}manifest.json`);
            this.manifest = await manifestResp.json();
            
            console.log(`✅ OEIS ready: ${Object.keys(this.index).length} sequences`);
            return true;
        } catch(e) {
            console.warn('OEIS not available, using fallback:', e);
            this.index = this.getFallbackIndex();
            return false;
        }
    }
    
    async decompressGzip(blob) {
        const ds = new DecompressionStream('gzip');
        const decompressedStream = blob.stream().pipeThrough(ds);
        const text = await new Response(decompressedStream).text();
        return text;
    }
    
    async loadSequence(id) {
        const normId = id.toUpperCase();
        
        // Find which chunk contains this ID
        const chunkNum = this.getIdChunk(normId);
        if (chunkNum !== null && !this.chunkCache.has(chunkNum)) {
            await this.loadChunk(chunkNum);
        }
        
        const chunk = this.chunkCache.get(chunkNum);
        if (chunk && chunk[normId]) {
            const seq = chunk[normId];
            return { data: seq.d, name: seq.n };
        }
        
        return this.getFallbackSequence(normId);
    }
    
    getIdChunk(id) {
        if (!this.index || !this.manifest) return null;
        const ids = Object.keys(this.index);
        const idx = ids.indexOf(id);
        if (idx === -1) return null;
        return Math.floor(idx / this.manifest.chunkSize);
    }
    
    async loadChunk(chunkNum) {
        try {
            const response = await fetch(`${this.basePath}chunk_${chunkNum}.json.gz`);
            const blob = await response.blob();
            const decompressed = await this.decompressGzip(blob);
            const chunk = JSON.parse(decompressed);
            this.chunkCache.set(chunkNum, chunk);
        } catch(e) {
            console.warn(`Could not load chunk ${chunkNum}:`, e);
        }
    }
    
    getFallbackIndex() {
        return {
            'A000027': { n: 'Natural numbers', t: 20 },
            'A000045': { n: 'Fibonacci', t: 20 },
            'A000079': { n: 'Powers of 2', t: 16 },
            'A000142': { n: 'Factorials', t: 14 },
            'A000217': { n: 'Triangular', t: 20 },
            'A000290': { n: 'Squares', t: 20 }
        };
    }
    
    getFallbackSequence(id) {
        const fallbacks = {
            'A000027': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
            'A000045': [0,1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181],
            'A000079': [1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768],
            'A000142': [1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800],
            'A000217': [0,1,3,6,10,15,21,28,36,45,55,66,78,91,105,120,136,153,171,190],
            'A000290': [0,1,4,9,16,25,36,49,64,81,100,121,144,169,196,225,256,289,324,361]
        };
        if (fallbacks[id]) return { data: fallbacks[id], name: id };
        throw new Error(`Sequence ${id} not available`);
    }
    
    search(query) {
        if (!this.index) return [];
        const q = query.toUpperCase();
        const results = [];
        for (const [id, info] of Object.entries(this.index)) {
            if (id.includes(q) || (info.n && info.n.toUpperCase().includes(q))) {
                results.push({ id, name: info.n, terms: info.t });
                if (results.length >= 15) break;
            }
        }
        return results;
    }
}
