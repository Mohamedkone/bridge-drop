import axios from "axios";
import { encryptFilesWithPublicKey, getEncryptionStats } from "./cryptoService.js";

export const handleFileUpload = async (acceptedFiles, setUploading, setUploaded, setUploadResult, settings, setProgress, api) => {
    const storageId = settings.bridge.storageId;
    if (acceptedFiles.length === 0) return; // No files to upload
    
    const isDiamond = settings.bridge.security === 2;
    setUploading(true);

    try {
        let filesToUpload = acceptedFiles;
        let encryptionMetadata = [];

        // Handle Diamond encryption for drive uploads
        if (isDiamond) {
            console.log("Diamond bridge detected - encrypting files for drive upload...");
            
            if (!settings.bridge?.key) {
                throw new Error("Diamond bridge requires a public key but none was found in bridge settings");
            }

            try {
                // Encrypt all files using the public key from frontend
                const encryptedPackages = await encryptFilesWithPublicKey(acceptedFiles, settings.bridge.key);
                
                // Replace original files with encrypted versions
                filesToUpload = encryptedPackages.map(pkg => pkg.encryptedFile);
                
                // Store encryption metadata for each file
                encryptionMetadata = encryptedPackages.map(pkg => ({
                    originalFilename: pkg.originalFilename,
                    originalSize: pkg.originalSize,
                    originalType: pkg.originalType,
                    encryptedSize: pkg.encryptedSize,
                    encryptionMethod: 'AES-256-GCM',
                    encryptionVersion: '2.0'
                }));
                
                // Log encryption statistics
                const stats = getEncryptionStats(encryptedPackages);
                console.log("Drive Encryption Statistics:", stats);
                console.log(`Files encrypted successfully for Diamond drive upload. Overhead: ${stats.overheadPercentage}`);
                
            } catch (encryptionError) {
                console.error("Drive encryption failed:", encryptionError);
                setUploadResult(false);
                setUploading(false);
                return;
            }
        }

        // Prepare form data with encrypted or original files
        const formData = new FormData();

        filesToUpload.forEach((file, index) => {
            formData.append('files', file);
            
            // Add encryption metadata if Diamond bridge
            if (isDiamond && encryptionMetadata[index]) {
                formData.append(`metadata_${index}`, JSON.stringify(encryptionMetadata[index]));
            }
        });

        // Add bridge security level and encryption info to form data
        if (isDiamond) {
            formData.append('securityLevel', '2');
            formData.append('encryptionVersion', '2.0');
            formData.append('encryptionMethod', 'AES-256-GCM');
            formData.append('encryptionMetadata', JSON.stringify(encryptionMetadata));
        }

        // Upload to drive storage
        await axios.post(`${api}/upload/${storageId}`, formData, {
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percentCompleted);
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        setUploaded(true);
        setUploadResult(true);

        // Log success message with encryption details
        if (isDiamond) {
            console.log(`✅ Successfully uploaded ${acceptedFiles.length} encrypted files to Diamond drive bridge`);
            console.log(`🔒 Files encrypted with military-grade AES-256-GCM encryption`);
            console.log(`📊 Encryption overhead: ${getEncryptionStats(encryptionMetadata).overheadPercentage}`);
        } else {
            console.log(`✅ Successfully uploaded ${acceptedFiles.length} files to Gold drive bridge`);
        }

    } catch (error) {
        console.error('Error uploading files to drive:', error);
        setUploadResult(false);

        // Enhanced error handling for Diamond bridges
        if (isDiamond) {
            if (error.message.includes("Diamond bridge requires a public key")) {
                console.error("❌ Diamond drive upload failed: No public key found in bridge settings");
            } else if (error.message.includes("Invalid public key")) {
                console.error("❌ Diamond drive upload failed: Invalid public key format");
            } else {
                console.error("❌ Diamond drive upload failed:", error.message);
            }
        }

    } finally {
        setUploading(false); // Reset uploading state
    }
};