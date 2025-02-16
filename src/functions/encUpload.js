import axios from "axios";
// import { deriveKey, encryptFile } from "./enc";
// import { encryptedForm } from "./encForm";


export const handleFileUpload = async (acceptedFiles, setUploading, setUploaded, setUploadResult, storageId) => {
    if (acceptedFiles.length === 0) return // No files to upload

    setUploading(true) // Set uploading state to true

    // const key = await deriveKey("userString");

    // Append files to the FormData object
    acceptedFiles.forEach(async(file) => {
    // encryptedForm(file, key)
    try {
        await axios.post(`http://localhost:3001/signedurls/${storageId}`,{
            fileNames: [file.name]
        }).then(async(res)=>{
            const sendme = await axios.put(res.data.signedUrls[file.name],{
                body: file
            })
    
            if (sendme.ok) {
                console.log('Files uploaded successfully')
                setUploaded(true)
                setUploadResult(true)
            } else {
                console.error('Error uploading files')
                setUploaded(true)
                setUploadResult(false)
            }
        })
        // const response = await fetch('http://localhost:3000/presign', {
        //     method: 'POST',
        //     body: param
        // })
        // console.log(response)
        // const signedUrl = await response.json()
        
        // const sendme = await fetch(signedUrl.url, {
        //     method: 'PUT',
        //     headers:{
        //         "Content-Type": file.type
        //     },
        //     body: file
        // })

        // if (sendme.ok) {
        //     console.log('Files uploaded successfully')
        //     setUploaded(true)
        //     setUploadResult(true)
        // } else {
        //     console.error('Error uploading files')
        //     setUploaded(true)
        //     setUploadResult(false)
        // }
    } catch (error) {
        console.error('Error uploading files:', error)
    } finally {
      setUploading(false) // Reset uploading state
    }
})

}