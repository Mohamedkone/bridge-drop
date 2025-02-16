import { encryptFile } from "./enc";

export const encryptedForm = async(file, key) =>{
const formData = new FormData()
const metadata = {
    filename: file.name,
    size: file.size,
    type: file.type,
};
const { encryptedFile, ivBase64 } = await encryptFile(file, key);
        formData.append('file', encryptedFile)
        formData.append('key', "5555");
        formData.append('iv', ivBase64);
        formData.append('metadata', JSON.stringify(metadata)); // Add metadata as a separate form field
}