
export class Md5Utils {
    private static readonly S: number[] = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];
    
    private static readonly K: number[] = [
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
        0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
        0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
        0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
        0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
        0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
        0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
        0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
        0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
        0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
        0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
        0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
    ];

    public static hash(message: string): string {
        const msgBytes = this.stringToUtf8Bytes(message);
        const blocks = this.padMessage(msgBytes);
        
        let a0 = 0x67452301;
        let b0 = 0xefcdab89;
        let c0 = 0x98badcfe;
        let d0 = 0x10325476;

        for (let i = 0; i < blocks.length; i += 16) {
            const block = blocks.slice(i, i + 16);
            const M = new Uint32Array(16);
            
            for (let j = 0; j < 16; j++) {
            M[j] = (block[j * 4 + 3] << 24) | 
                    (block[j * 4 + 2] << 16) | 
                    (block[j * 4 + 1] << 8) | 
                    block[j * 4];
            }

            let A = a0;
            let B = b0;
            let C = c0;
            let D = d0;

            for (let j = 0; j < 64; j++) {
            let F, g;
            if (j < 16) {
                F = (B & C) | (~B & D);
                g = j;
            } else if (j < 32) {
                F = (D & B) | (~D & C);
                g = (5 * j + 1) % 16;
            } else if (j < 48) {
                F = B ^ C ^ D;
                g = (3 * j + 5) % 16;
            } else {
                F = C ^ (B | ~D);
                g = (7 * j) % 16;
            }

            F = F + A + this.K[j] + M[g];
            A = D;
            D = C;
            C = B;
            B = B + this.leftRotate(F, this.S[j]);
            }

            a0 += A;
            b0 += B;
            c0 += C;
            d0 += D;
        }

        return this.toHexString(a0) + this.toHexString(b0) + this.toHexString(c0) + this.toHexString(d0);
    }

    private static leftRotate(n: number, s: number): number {
        return (n << s) | (n >>> (32 - s));
    }

    private static stringToUtf8Bytes(str: string): number[] {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 0x80) {
            bytes.push(c);
            } else if (c < 0x800) {
            bytes.push(0xc0 | (c >> 6));
            bytes.push(0x80 | (c & 0x3f));
            } else {
            bytes.push(0xe0 | (c >> 12));
            bytes.push(0x80 | ((c >> 6) & 0x3f));
            bytes.push(0x80 | (c & 0x3f));
            }
        }
        return bytes;
    }

    private static padMessage(bytes: number[]): number[] {
        const bitLength = bytes.length * 8;
        bytes.push(0x80);
        
        while ((bytes.length * 8) % 512 !== 448) {
            bytes.push(0x00);
        }
        
        const lengthBytes = new Array(8);
        for (let i = 0; i < 8; i++) {
            lengthBytes[i] = (bitLength >>> (i * 8)) & 0xff;
        }
        
        return bytes.concat(...lengthBytes);
    }
    
    private static toHexString(n: number): string {
        let s = '';
        for (let i = 0; i < 4; i++) {
            const byte = (n >>> (i * 8)) & 0xff;
            s += byte.toString(16).padStart(2, '0');
        }
        return s;
    }
}