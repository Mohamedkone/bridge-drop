// encryptionUtil.js
export async function deriveKey(userString) {
    const encoder = new TextEncoder();
    const combinedBytes = encoder.encode(userString);

    const hash = await crypto.subtle.digest('SHA-256', combinedBytes);
    return await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptFile(file, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const fileBuffer = await file.arrayBuffer();
    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv

        },
        key,
        fileBuffer,
    );

    // Convert IV to Base64
    const ivBase64 = btoa(String.fromCharCode(...iv));

    // Create a Blob with the IV and encrypted data
    const ivAndEncryptedData = new Blob([iv, encryptedBuffer], { type: file.type });
    const encryptedFile = new File([ivAndEncryptedData], file.name, { type: file.type });
    return { encryptedFile, ivBase64 };
}


export async function decryptFile(encryptedBlob, key, ivBase64) {
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0)); // Decode IV from Base64

    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const dataBuffer = arrayBuffer.slice(12); // Extract the rest of the encrypted data

    const decryptedBuffer = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        dataBuffer
    );

    // Create a Blob with the decrypted data and the correct type
    return new Blob([decryptedBuffer], { type: encryptedBlob.type });
}
