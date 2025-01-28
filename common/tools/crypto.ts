import * as CryptoJS from 'crypto-js';
import * as Base64 from "byte-base64";

export namespace Crypto {

    export const generateSecretKey = (): string => {
        const keyLength = 32; // 32 bytes = 256 bits (AES-256)
        const buffer = new Uint8Array(keyLength);
        crypto.getRandomValues(buffer);
        return Array.from(buffer, (byte) =>
            byte.toString(16).padStart(2, '0')
        ).join('');
    };

    export const encryptData = (data: string, secretKey: string): string => {
        return CryptoJS.AES.encrypt(data, secretKey).toString();
    };

    export const decryptData = (encryptedData: string, secretKey: string): string => {
        return CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
    };

    export const encryptFile = (file: ArrayBufferLike, secretKey: string): string => {
        return encryptData(Base64.bytesToBase64(new Uint8Array(file)), secretKey);
    }

    export const decryptFile = (encryptedFile: string, secretKey: string): ArrayBufferLike => {
        return Base64.base64ToBytes(decryptData(encryptedFile, secretKey));
    }

}