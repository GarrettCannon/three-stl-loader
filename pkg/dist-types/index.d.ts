import * as THREE from "three";
export default class STLLoader {
    parse(data: any): any;
    parseBinary(data: any): THREE.BufferGeometry;
    parseASCII(data: any): any;
    ensureString(buf: any): string;
    ensureBinary(buf: any): any;
}
