// localServerUploader.js - Sends all files to your local server (port 3003)
import axios from "axios";
import { encryptFilesForDiamond } from "./cryptoService.js";

export const handleFileUpload = async (
  acceptedFiles, 
  setUploading, 
  setUploaded, 
  setUploadResult, 
  storageId, 
  setProgress, 
  storageType, 
  bridgeSettings,
  storageLink
) => {
  if (acceptedFiles.length === 0) return;
  
  setUploading(true);
  
  try {
    // Check if this is a Diamond bridge (security level 2)
    const isDiamondBridge = bridgeSettings?.security === 2;
    
    console.log(`Processing ${acceptedFiles.length} files for ${isDiamondBridge ? 'Diamond' : 'Gold'} bridge`);
    
    if (isDiamondBridge) {
      // Diamond Bridge - Encrypt files first
      await handleDiamondUpload(acceptedFiles, storageId, setProgress, setUploadResult, storageLink);
    } else {
      // Gold Bridge - Upload files directly
      await handleGoldUpload(acceptedFiles, storageId, setProgress, setUploadResult, storageLink);
    }
    
    setUploaded(true);
    setUploadResult(true);
    
  } catch (error) {
    console.error('Upload failed:', error);
    setUploadResult(false);
  } finally {
    setUploading(false);
  }
};

// Handle Diamond bridge uploads (with encryption)
async function handleDiamondUpload(acceptedFiles, storageId, setProgress, setUploadResult, storageLink) {
  console.log("Diamond bridge detected - encrypting files...");
  
  try {
    // Encrypt all files
    const encryptedPackages = await encryptFilesForDiamond(acceptedFiles, storageId);
    
    // Upload each encrypted file
    for (let i = 0; i < encryptedPackages.length; i++) {
      const pkg = encryptedPackages[i];
      const originalFile = acceptedFiles[i];
      
      await uploadEncryptedFile(pkg, storageId, originalFile.name, setProgress, storageLink);
    }
    
    console.log("All Diamond files encrypted and uploaded successfully");
    
  } catch (error) {
    console.error("Diamond encryption/upload failed:", error);
    throw error;
  }
}

// Handle Gold bridge uploads (no encryption)
async function handleGoldUpload(acceptedFiles, storageId, setProgress, setUploadResult, storageLink) {
  console.log("Gold bridge detected - uploading files directly...");
  
  try {
    // Upload each file directly
    for (const file of acceptedFiles) {
      await uploadUnencryptedFile(file, storageId, setProgress, storageLink);
    }
    
    console.log("All Gold files uploaded successfully");
    
  } catch (error) {
    console.error("Gold upload failed:", error);
    throw error;
  }
}

// Upload encrypted file to local server
async function uploadEncryptedFile(encryptedPackage, storageId, originalFileName, setProgress, storageLink) {
  const formData = new FormData();
  
  // Add the encrypted file
  formData.append('file', encryptedPackage.encryptedFile);
  
  // Add Diamond encryption metadata
  formData.append('originalFilename', encryptedPackage.originalFilename);
  formData.append('originalSize', encryptedPackage.originalSize.toString());
  formData.append('originalType', encryptedPackage.originalType);
  formData.append('encryptedKey', encryptedPackage.encryptedKey);
  formData.append('iv', encryptedPackage.iv);
  
  console.log(`Uploading encrypted file: ${encryptedPackage.originalFilename}`);
  
  try {
    const response = await axios.post(
      `${storageLink}/upload/${storageId}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress((prevProgress) => {
            if (!prevProgress) prevProgress = {};
            return {
              ...prevProgress,
              [originalFileName]: percentCompleted,
            };
          });
        }
      }
    );
    
    console.log(`Encrypted file upload response:`, response.data);
    
    // Set final progress to 100%
    setProgress((prevProgress) => ({
      ...prevProgress,
      [originalFileName]: 100,
    }));
    
  } catch (error) {
    console.error(`Failed to upload encrypted file ${encryptedPackage.originalFilename}:`, error);
    throw error;
  }
}

// Upload unencrypted file to local server
async function uploadUnencryptedFile(file, storageId, setProgress, storageLink) {
  const formData = new FormData();
  
  // Add the file
  formData.append('file', file);
  
  // Add basic metadata for Gold bridge
  const metadata = {
    filename: file.name,
    size: file.size,
    type: file.type,
    uploadTime: new Date().toISOString()
  };
  formData.append('metadata', JSON.stringify(metadata));
  
  console.log(`Uploading unencrypted file: ${file.name}`);
  
  try {
    const response = await axios.post(
      `${storageLink}/upload/${storageId}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress((prevProgress) => {
            if (!prevProgress) prevProgress = {};
            return {
              ...prevProgress,
              [file.name]: percentCompleted,
            };
          });
        }
      }
    );
    
    console.log(`Unencrypted file upload response:`, response.data);
    
    // Set final progress to 100%
    setProgress((prevProgress) => ({
      ...prevProgress,
      [file.name]: 100,
    }));
    
  } catch (error) {
    console.error(`Failed to upload unencrypted file ${file.name}:`, error);
    throw error;
  }
}

// Utility function to get file info from server
export async function getFileInfo(storageId, filename, storageLink) {
  try {
    const response = await axios.get(`${storageLink}/info/${storageId}/${filename}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get file info for ${filename}:`, error);
    return null;
  }
}

// Utility function to list all files in a bridge
export async function listBridgeFiles(storageId, storageLink) {
  try {
    const response = await axios.get(`${storageLink}/list/${storageId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to list files for bridge ${storageId}:`, error);
    return null;
  }
}

// Utility function to download a file
export async function downloadFile(storageId, filename, storageLink) {
  try {
    const response = await axios.get(
      `${storageLink}/download/${storageId}/${filename}`,
      { responseType: 'blob' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers or use provided filename
    const contentDisposition = response.headers['content-disposition'];
    let downloadFilename = filename;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        downloadFilename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', downloadFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error(`Failed to download file ${filename}:`, error);
    return false;
  }
}