export declare namespace Crypto {
    const generateSecretKey: () => string;
    const encryptData: (data: string, secretKey: string) => string;
    const decryptData: (encryptedData: string, secretKey: string) => string;
    const encryptFile: (file: ArrayBufferLike, secretKey: string) => string;
    const decryptFile: (encryptedFile: string, secretKey: string) => ArrayBufferLike;
}
