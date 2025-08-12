// cryptoService.js - New Diamond bridge encryption service
// Based on the military-grade encryption app we built

/**
 * Fetch the public key for a bridge from the server
 * This should be the public key that was generated when the bridge was created
 * @param {string} bridgeId - The bridge ID
 * @returns {Promise<string>} Public key in format "keyHex:saltHex"
 */
async function fetchBridgePublicKey(bridgeId) {
  try {
    console.log(`Fetching public key for bridge: ${bridgeId}`);
    
    // This would typically be an API call to get the bridge's public key
    // For now, we'll assume it's passed through the settings or fetched from your backend
    // You'll need to implement this based on your backend API
    
    // Example API call (you'll need to implement this endpoint):
    // const response = await axios.get(`http://localhost:3001/bridges/${bridgeId}/publickey`);
    // return response.data.publicKey;
    
    // For testing, throw an error to indicate this needs implementation
    throw new Error("fetchBridgePublicKey needs to be implemented with your backend API");
    
  } catch (error) {
    console.error("Error fetching bridge public key:", error);
    throw new Error("Failed to fetch bridge public key");
  }
}

/**
 * Parse and validate public key format
 * @param {string} publicKeyString - Public key in format "keyHex:saltHex"
 * @returns {Object} Parsed key components
 */
function parsePublicKey(publicKeyString) {
  if (!publicKeyString || typeof publicKeyString !== 'string') {
    throw new Error("Invalid public key format");
  }

  const parts = publicKeyString.split(':');
  if (parts.length !== 2) {
    throw new Error("Invalid public key format. Expected format: key:salt");
  }

  const keyHex = parts[0];
  const saltHex = parts[1];

  // Validate hex strings
  if (!/^[0-9a-fA-F]+$/.test(keyHex) || !/^[0-9a-fA-F]+$/.test(saltHex)) {
    throw new Error("Invalid key format. Key must contain only hexadecimal characters.");
  }

  // Convert hex to bytes
  const keyBytes = new Uint8Array(keyHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));

  // Validate key and salt lengths
  if (keyBytes.length !== 32) {
    throw new Error("Invalid key length. Expected 256-bit (32-byte) key.");
  }

  if (salt.length !== 16) {
    throw new Error("Invalid salt length. Expected 128-bit (16-byte) salt.");
  }

  return { keyBytes, salt };
}

/**
 * Import the derived key for encryption
 * @param {Uint8Array} keyBytes - Raw key bytes
 * @returns {Promise<CryptoKey>} Imported crypto key
 */
async function importEncryptionKey(keyBytes) {
  return await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
}

/**
 * Encrypt a single file using the bridge's public key
 * @param {File} file - File to encrypt
 * @param {string} publicKey - Bridge public key in format "keyHex:saltHex"
 * @returns {Promise<Object>} Encrypted file package
 */
async function encryptSingleFile(file, publicKey) {
  try {
    console.log(`Encrypting file: ${file.name}`);

    // Parse and validate the public key
    const { keyBytes, salt } = parsePublicKey(publicKey);

    // Import the key for encryption
    const derivedKey = await importEncryptionKey(keyBytes);

    // Read the file data
    const fileData = await file.arrayBuffer();

    // Generate a random IV for this encryption
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the file
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      derivedKey,
      fileData
    );

    // Combine salt, iv, and encrypted data with filename
    const encryptedArray = new Uint8Array(encrypted);
    const filenameBytes = new TextEncoder().encode(file.name);
    const filenameLengthArray = new Uint32Array([filenameBytes.length]);
    const filenameLengthBytes = new Uint8Array(filenameLengthArray.buffer);
    
    const combined = new Uint8Array(
      filenameLengthBytes.length + 
      filenameBytes.length + 
      salt.length + 
      iv.length + 
      encryptedArray.length
    );
    
    let offset = 0;
    combined.set(filenameLengthBytes, offset);
    offset += filenameLengthBytes.length;
    combined.set(filenameBytes, offset);
    offset += filenameBytes.length;
    combined.set(salt, offset);
    offset += salt.length;
    combined.set(iv, offset);
    offset += iv.length;
    combined.set(encryptedArray, offset);

    // Create encrypted file blob
    const encryptedFile = new File(
      [combined], 
      `${file.name}.enc`, 
      { type: 'application/octet-stream' }
    );

    console.log(`File encrypted successfully: ${file.name} -> ${encryptedFile.name}`);

    return {
      encryptedFile,
      originalFilename: file.name,
      originalSize: file.size,
      originalType: file.type,
      encryptedSize: encryptedFile.size,
      // For compatibility with existing metadata structure
      encryptedKey: null, // Not needed in our implementation
      iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('') // For logging/debugging
    };

  } catch (error) {
    console.error(`Failed to encrypt file ${file.name}:`, error);
    throw new Error(`Encryption failed for ${file.name}: ${error.message}`);
  }
}

/**
 * Main encryption function for Diamond bridges - handles one or many files
 * @param {File[]} files - Array of files to encrypt
 * @param {string} bridgeId - Bridge ID to get public key
 * @returns {Promise<Object[]>} Array of encrypted file packages
 */
export async function encryptFilesForDiamond(files, bridgeId) {
  console.log(`Starting Diamond encryption for ${files.length} file(s) using bridge: ${bridgeId}`);

  try {
    // Fetch the bridge's public key
    const publicKey = await fetchBridgePublicKey(bridgeId);
    
    // Validate we have files to encrypt
    if (!files || files.length === 0) {
      throw new Error("No files provided for encryption");
    }

    // Encrypt all files
    const encryptedPackages = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file || !file.name) {
        console.warn(`Skipping invalid file at index ${i}`);
        continue;
      }

      try {
        const encryptedPackage = await encryptSingleFile(file, publicKey);
        encryptedPackages.push(encryptedPackage);
        
        console.log(`✓ Encrypted ${i + 1}/${files.length}: ${file.name}`);
      } catch (fileError) {
        console.error(`✗ Failed to encrypt ${file.name}:`, fileError);
        // Depending on your requirements, you might want to:
        // 1. Throw and stop the entire process
        // 2. Continue with other files and collect errors
        // For now, we'll throw to maintain data integrity
        throw fileError;
      }
    }

    if (encryptedPackages.length === 0) {
      throw new Error("No files were successfully encrypted");
    }

    console.log(`✅ Successfully encrypted ${encryptedPackages.length}/${files.length} files for Diamond bridge`);
    
    return encryptedPackages;

  } catch (error) {
    console.error("Diamond encryption failed:", error);
    throw new Error(`Diamond encryption failed: ${error.message}`);
  }
}

/**
 * Utility function to get encryption statistics
 * @param {Object[]} encryptedPackages - Array of encrypted file packages
 * @returns {Object} Encryption statistics
 */
export function getEncryptionStats(encryptedPackages) {
  const totalOriginalSize = encryptedPackages.reduce((sum, pkg) => sum + pkg.originalSize, 0);
  const totalEncryptedSize = encryptedPackages.reduce((sum, pkg) => sum + pkg.encryptedSize, 0);
  const overhead = totalEncryptedSize - totalOriginalSize;
  const overheadPercentage = ((overhead / totalOriginalSize) * 100).toFixed(2);

  return {
    fileCount: encryptedPackages.length,
    totalOriginalSize,
    totalEncryptedSize,
    overhead,
    overheadPercentage: `${overheadPercentage}%`,
    averageOverheadPerFile: Math.round(overhead / encryptedPackages.length)
  };
}

/**
 * Alternative function to encrypt files with a provided public key
 * (bypasses the need to fetch from server)
 * @param {File[]} files - Array of files to encrypt
 * @param {string} publicKey - Public key in format "keyHex:saltHex"
 * @returns {Promise<Object[]>} Array of encrypted file packages
 */
export async function encryptFilesWithPublicKey(files, publicKey) {
  console.log(`Starting Diamond encryption for ${files.length} file(s) with provided public key`);

  try {
    // Validate inputs
    if (!files || files.length === 0) {
      throw new Error("No files provided for encryption");
    }

    if (!publicKey) {
      throw new Error("No public key provided for encryption");
    }

    // Encrypt all files
    const encryptedPackages = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file || !file.name) {
        console.warn(`Skipping invalid file at index ${i}`);
        continue;
      }

      try {
        const encryptedPackage = await encryptSingleFile(file, publicKey);
        encryptedPackages.push(encryptedPackage);
        
        console.log(`✓ Encrypted ${i + 1}/${files.length}: ${file.name}`);
      } catch (fileError) {
        console.error(`✗ Failed to encrypt ${file.name}:`, fileError);
        throw fileError;
      }
    }

    if (encryptedPackages.length === 0) {
      throw new Error("No files were successfully encrypted");
    }

    console.log(`✅ Successfully encrypted ${encryptedPackages.length}/${files.length} files with provided public key`);
    
    return encryptedPackages;

  } catch (error) {
    console.error("Diamond encryption with public key failed:", error);
    throw new Error(`Diamond encryption failed: ${error.message}`);
  }
}
