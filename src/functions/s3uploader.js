// s3uploader.js - Updated with new Diamond encryption service
import axios from "axios";
import { encryptFilesForDiamond, encryptFilesWithPublicKey, getEncryptionStats } from "./cryptoService.js";

export const handleFileUpload = async (
  acceptedFiles, 
  setUploading, 
  setUploaded, 
  setUploadResult, 
  settings, 
  setUploadProgress,
  api
) => {

  console.log(settings)
  const storageType = settings?.bridge.system;
  const storageId = settings?.bridge.storageId;
  
  if (acceptedFiles.length === 0) return;
  
  const type = storageType === 'vault' ? 'd' : storageType === 's3' ? 's' : null;
  setUploading(true);
  
  try {
    // Check if this is a Diamond bridge (security level 2)
    const isDiamondBridge = settings.bridge?.security === 2;
    
    let filesToUpload = acceptedFiles;
    let encryptionMetadata = [];
    
    // Handle Diamond encryption with new encryption service
    if (isDiamondBridge) {
      console.log("Diamond bridge detected - encrypting files with new encryption service...");
      
      try {
        let encryptedPackages;
        
        // Option 1: Use public key from bridge settings if available
        if (settings.bridge?.key) {
          console.log("Using public key from bridge settings");
          encryptedPackages = await encryptFilesWithPublicKey(acceptedFiles, settings.bridge.key);
        } 
        // Option 2: Fetch public key from backend using bridge ID
        else {
          console.log("Fetching public key from backend");
          encryptedPackages = await encryptFilesForDiamond(acceptedFiles, storageId);
        }
        
        // Replace original files with encrypted versions
        filesToUpload = encryptedPackages.map(pkg => pkg.encryptedFile);
        
        // Store encryption metadata for each file (updated format)
        encryptionMetadata = encryptedPackages.map(pkg => ({
          originalFilename: pkg.originalFilename,
          originalSize: pkg.originalSize,
          originalType: pkg.originalType,
          encryptedSize: pkg.encryptedSize,
          // Note: encryptedKey and iv are now embedded in the .enc file
          // so we don't need to store them separately
          encryptionMethod: 'AES-256-GCM',
          encryptionVersion: '2.0' // New encryption version
        }));
        
        // Log encryption statistics
        const stats = getEncryptionStats(encryptedPackages);
        console.log("Encryption Statistics:", stats);
        console.log(`Files encrypted successfully for Diamond bridge. Overhead: ${stats.overheadPercentage}`);
        
      } catch (encryptionError) {
        console.error("Encryption failed:", encryptionError);
        setUploadResult(false);
        setUploading(false);
        
        // Show user-friendly error message
        if (encryptionError.message.includes("fetchBridgePublicKey needs to be implemented")) {
          console.error("Backend integration needed: Please implement public key endpoint");
        }
        
        return;
      }
    }
    
    if (type === 's') {
      // S3 Upload Process
      const fileNames = filesToUpload.map((file, index) => {
        // For encrypted files, keep the .enc extension from the encryption service
        if (isDiamondBridge) {
          // The file already has the .enc extension from encryptSingleFile
          return `diamond_${Date.now()}_${index}_${file.name}`;
        }
        return file.name;
      });
      
      const res = await axios.post(`${api}/signedurls/${type}/${storageId}`, { 
        fileNames,
        // Include updated encryption metadata for Diamond bridges
        ...(isDiamondBridge && { 
          encryptionMetadata,
          securityLevel: 2,
          encryptionVersion: '2.0'
        })
      });

      await Promise.all(
        filesToUpload.map(async (file, index) => {
          const fileName = fileNames[index];
          const signedUrl = res.data.signedUrls[fileName];

          await axios.put(signedUrl, file, {
            headers: {
              'Content-Type': isDiamondBridge ? 'application/octet-stream' : file.type
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress((prevProgress) => {
                if (!prevProgress) prevProgress = {};
                return {
                  ...prevProgress,
                  // Use original filename for progress tracking (user-friendly)
                  [acceptedFiles[index].name]: percentCompleted,
                };
              });
            }
          });
        })
      );

      setUploaded(true);
      setUploadResult(true);
      
    } else {
      // Distributed Storage Upload Process
      const formData = new FormData();

      filesToUpload.forEach((file, index) => {
        formData.append('files', file);
        
        // Add updated encryption metadata if Diamond bridge
        if (isDiamondBridge && encryptionMetadata[index]) {
          formData.append(`metadata_${index}`, JSON.stringify(encryptionMetadata[index]));
        }
      });
      
      // Add bridge security level and encryption info to form data
      if (isDiamondBridge) {
        formData.append('securityLevel', '2');
        formData.append('encryptionVersion', '2.0');
        formData.append('encryptionMethod', 'AES-256-GCM');
        formData.append('encryptionMetadata', JSON.stringify(encryptionMetadata));
      }

      await axios.post(`${api}/ds-upload/${storageId}`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploaded(true);
      setUploadResult(true);
    }
    
    // Log success message with encryption details
    if (isDiamondBridge) {
      console.log(`✅ Successfully uploaded ${acceptedFiles.length} encrypted files to Diamond bridge`);
      console.log(`🔒 Files encrypted with military-grade AES-256-GCM encryption`);
      console.log(`📊 Encryption overhead: ${getEncryptionStats(encryptionMetadata).overheadPercentage}`);
    } else {
      console.log(`✅ Successfully uploaded ${acceptedFiles.length} files to Gold bridge`);
    }
    
  } catch (error) {
    console.error('Error uploading files:', error);
    setUploadResult(false);
    
    // Enhanced error handling for Diamond bridges
    if (settings.bridge?.security === 2) {
      if (error.message.includes("Invalid public key")) {
        console.error("❌ Diamond bridge encryption failed: Invalid public key format");
      } else if (error.message.includes("Failed to fetch bridge public key")) {
        console.error("❌ Diamond bridge encryption failed: Could not retrieve encryption key");
      } else {
        console.error("❌ Diamond bridge encryption failed:", error.message);
      }
    }
    
  } finally {
    setUploading(false);
  }
};