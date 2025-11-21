// Utilities for Client-Side Encryption (AES-GCM)

// Convert ArrayBuffer to Base64
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Convert Base64 to Uint8Array
export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Generate a random encryption key (AES-GCM)
export const generateKey = async (): Promise<CryptoKey> => {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
};

// Export key to JWK for sharing via URL fragment
export const exportKey = async (key: CryptoKey): Promise<JsonWebKey> => {
  return window.crypto.subtle.exportKey("jwk", key);
};

// Import key from JWK
export const importKey = async (jwk: JsonWebKey): Promise<CryptoKey> => {
  return window.crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );
};

// Encrypt text
export const encryptNote = async (text: string, key: CryptoKey): Promise<{ iv: string; ciphertext: string }> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV standard for GCM

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );

  return {
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(encryptedBuffer),
  };
};

// Decrypt text
export const decryptNote = async (ciphertextB64: string, ivB64: string, key: CryptoKey): Promise<string> => {
  const ciphertext = base64ToUint8Array(ciphertextB64);
  const iv = base64ToUint8Array(ivB64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};