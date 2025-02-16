import axios from "axios";

export const handleFileUpload = async (acceptedFiles, setUploading, setUploaded, setUploadResult, storageId, setProgress) => {
    if (acceptedFiles.length === 0) return; // No files to upload

    setUploading(true);

    const formData = new FormData();

    acceptedFiles.forEach((file) => {
        formData.append('files', file);
    });

    try {
        await axios.post(`http://localhost:3001/upload/${storageId}`, formData, {
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
    } catch (error) {
        console.error('Error uploading files:', error);
        setUploadResult(false);
    } finally {
        setUploading(false); // Reset uploading state
    }
};