import axios from "axios";

export const handleFileUpload = async (acceptedFiles, setUploading, setUploaded, setUploadResult, storageId, setProgress,storageType) => {
    if (acceptedFiles.length === 0) return;
    const type = storageType==='vault'?'d':storageType==='s3'?'s':null
    setUploading(true);
    if(type === 's'){
    const fileNames = acceptedFiles.map(file => file.name);
    try {
        const res = await axios.post(`http://localhost:3001/signedurls/${type}/${storageId}`, { fileNames });

        await Promise.all(
            acceptedFiles.map(async (file) => {
                const signedUrl = res.data.signedUrls[file.name];

                await axios.put(signedUrl, file, {
                    headers: {
                        'Content-Type': file.type
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress((prevProgress) => {
                            if (!prevProgress) prevProgress = {}; // Ensure it's not undefined
                            return {
                                ...prevProgress,
                                [file.name]: percentCompleted,
                            };
                        });
                    }
                });
            })
        );

        setUploaded(true);
        setUploadResult(true);
    } catch (error) {
        console.error('Error uploading files:', error);
        setUploadResult(false);
    } finally {
        setUploading(false); // Reset uploading state
    }
}else{
    const formData = new FormData();

    acceptedFiles.forEach((file) => {
        formData.append('files', file);
    });

    try {
        await axios.post(`http://localhost:3001/ds-upload/${storageId}`, formData, {
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
}
};
