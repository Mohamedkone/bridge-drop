import '../../../App.css'
import { Button, Text, useFileUploadContext, VStack, HStack } from '@chakra-ui/react'
import { handleFileUpload as hfs } from '../../../functions/s3uploader'
import { handleFileUpload as hfa } from '../../../functions/uploadDrive'
import { MainContext } from '../../../context/MainContext'
import { useContext } from 'react'
import { BiCheckCircle } from 'react-icons/bi'

export default function UploadTrigger() {
    const { acceptedFiles } = useFileUploadContext()
    const { uploading, setUploaded, setUploading, setUploadResult, settings } = useContext(MainContext)
    const {uploadProgress, setUploadProgress} = useContext(MainContext);



    return (
        <>
        {
            settings?.bridge.system === "api"?
            <Button className='trigger' onClick={()=>hfa(acceptedFiles, setUploading, setUploaded, setUploadResult, settings.bridge.storageId,setUploadProgress)} disabled={uploading?true:false}>Upload </Button>
            :
            <Button className='trigger' onClick={()=>hfs(acceptedFiles, setUploading, setUploaded, setUploadResult, settings.bridge.storageId, setUploadProgress, settings.bridge.system)} disabled={uploading||acceptedFiles.length===0?true:false}>Upload </Button>
        }
        {acceptedFiles.map((file) => (
                <VStack key={file.name} w="100%" align="stretch">
                    <Text fontSize="sm">{file.name}</Text>
                    <HStack>
                    <Text fontSize="xs">{uploadProgress[file.name] || 0}%</Text>
                    {uploadProgress[file.name]===100&&<BiCheckCircle color='green' />}
                    </HStack>
                </VStack>
            ))}
        </>
    )
}
