"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crypto = void 0;
var CryptoJS = require("crypto-js");
var Base64 = require("byte-base64");
var Crypto;
(function (Crypto) {
    Crypto.generateSecretKey = function () {
        var keyLength = 32; // 32 bytes = 256 bits (AES-256)
        var buffer = new Uint8Array(keyLength);
        crypto.getRandomValues(buffer);
        return Array.from(buffer, function (byte) {
            return byte.toString(16).padStart(2, '0');
        }).join('');
    };
    Crypto.encryptData = function (data, secretKey) {
        return CryptoJS.AES.encrypt(data, secretKey).toString();
    };
    Crypto.decryptData = function (encryptedData, secretKey) {
        return CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
    };
    Crypto.encryptFile = function (file, secretKey) {
        return Crypto.encryptData(Base64.bytesToBase64(new Uint8Array(file)), secretKey);
    };
    Crypto.decryptFile = function (encryptedFile, secretKey) {
        return Base64.base64ToBytes(Crypto.decryptData(encryptedFile, secretKey));
    };
})(Crypto || (exports.Crypto = Crypto = {}));
