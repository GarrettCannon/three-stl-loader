"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
class STLLoader {
    parse(data) {
        let isBinary = function () {
            let expect, face_size, n_faces, reader;
            reader = new DataView(binData);
            face_size = (32 / 8) * 3 + (32 / 8) * 3 * 3 + 16 / 8;
            n_faces = reader.getUint32(80, true);
            expect = 80 + 32 / 8 + n_faces * face_size;
            if (expect === reader.byteLength) {
                return true;
            }
            // An ASCII STL data must begin with 'solid ' as the first six bytes.
            // However, ASCII STLs lacking the SPACE after the 'd' are known to be
            // plentiful.  So, check the first 5 bytes for 'solid'.
            // US-ASCII ordinal values for 's', 'o', 'l', 'i', 'd'
            let solid = [115, 111, 108, 105, 100];
            for (let i = 0; i < 5; i++) {
                // If solid[ i ] does not match the i-th byte, then it is not an
                // ASCII STL; hence, it is binary and return true.
                if (solid[i] != reader.getUint8(i, false))
                    return true;
            }
            // First 5 bytes read "solid"; declare it to be an ASCII STL
            return false;
        };
        let binData = this.ensureBinary(data);
        return isBinary()
            ? this.parseBinary(binData)
            : this.parseASCII(this.ensureString(data));
    }
    parseBinary(data) {
        let reader = new DataView(data);
        let faces = reader.getUint32(80, true);
        let dataOffset = 84;
        let faceLength = 12 * 4 + 2;
        let geometry = new THREE.BufferGeometry();
        let vertices = [];
        let normals = [];
        for (let face = 0; face < faces; face++) {
            let start = dataOffset + face * faceLength;
            let normalX = reader.getFloat32(start, true);
            let normalY = reader.getFloat32(start + 4, true);
            let normalZ = reader.getFloat32(start + 8, true);
            for (let i = 1; i <= 3; i++) {
                let vertexstart = start + i * 12;
                vertices.push(reader.getFloat32(vertexstart, true));
                vertices.push(reader.getFloat32(vertexstart + 4, true));
                vertices.push(reader.getFloat32(vertexstart + 8, true));
                normals.push(normalX, normalY, normalZ);
            }
        }
        geometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), 3));
        return geometry;
    }
    parseASCII(data) {
        let geometry, length, patternFace, patternNormal, patternVertex, result, text;
        geometry = new THREE.BufferGeometry();
        patternFace = /facet([\s\S]*?)endfacet/g;
        let vertices = [];
        let normals = [];
        let normal = new THREE.Vector3();
        while ((result = patternFace.exec(data)) !== null) {
            text = result[0];
            patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
            while ((result = patternNormal.exec(text)) !== null) {
                normal.x = parseFloat(result[1]);
                normal.y = parseFloat(result[3]);
                normal.z = parseFloat(result[5]);
            }
            patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
            while ((result = patternVertex.exec(text)) !== null) {
                vertices.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
                normals.push(normal.x, normal.y, normal.z);
            }
        }
        geometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(normals), 3));
        return geometry;
    }
    ensureString(buf) {
        if (typeof buf !== "string") {
            let array_buffer = new Uint8Array(buf);
            let strArray = [];
            for (let i = 0; i < buf.byteLength; i++) {
                strArray.push(String.fromCharCode(array_buffer[i])); // implicitly assumes little-endian
            }
            return strArray.join("");
        }
        else {
            return buf;
        }
    }
    ensureBinary(buf) {
        if (typeof buf === "string") {
            let array_buffer = new Uint8Array(buf.length);
            for (let i = 0; i < buf.length; i++) {
                array_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian
            }
            return array_buffer.buffer || array_buffer;
        }
        else {
            return buf;
        }
    }
}
exports.default = STLLoader;
