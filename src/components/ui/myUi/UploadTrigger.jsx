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
    const {uploadProgress, setUploadProgress, storageLink, api} = useContext(MainContext);



    return (
        <>
        {
            settings?.bridge.system === "api"?
            <Button className='trigger' onClick={()=>hfa(acceptedFiles, setUploading, setUploaded, setUploadResult, settings,setUploadProgress, api)} disabled={uploading?true:false}>Upload </Button>
            :
            <Button className='trigger' onClick={()=>hfs(acceptedFiles, setUploading, setUploaded, setUploadResult, settings, setUploadProgress, api)} disabled={uploading||acceptedFiles.length===0?true:false}>Upload </Button>
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
// UploadTrigger.jsx - Updated to support Diamond encryption
// import '../../../App.css'
// import { Button, Text, useFileUploadContext, VStack, HStack, Badge } from '@chakra-ui/react'
// import { handleFileUpload as localUpload } from '../../../functions/localServerUploader'
// import { MainContext } from '../../../context/MainContext'
// import { useContext } from 'react'
// import { BiCheckCircle } from 'react-icons/bi'
// import { IoDiamond } from 'react-icons/io5'
// import { GiGoldBar } from 'react-icons/gi'

// export default function UploadTrigger() {
//     const { acceptedFiles } = useFileUploadContext()
//     const { uploading, setUploaded, setUploading, setUploadResult, settings } = useContext(MainContext)
//     const { uploadProgress, setUploadProgress } = useContext(MainContext);

//     const isDiamondBridge = settings?.bridge?.security === 2;
//     const isGoldBridge = settings?.bridge?.security === 1;

//     const handleUpload = () => {
//         // Always use local server upload regardless of bridge system type
//         localUpload(
//             acceptedFiles, 
//             setUploading, 
//             setUploaded, 
//             setUploadResult, 
//             settings.bridge.storageId, 
//             setUploadProgress, 
//             settings.bridge.system,
//             settings.bridge // Pass full bridge settings for encryption detection
//         );
//     };

//     return (
//         <>
//             {/* Security Level Indicator */}
//             {isDiamondBridge && (
//                 <Badge 
//                     colorScheme="purple" 
//                     variant="surface" 
//                     fontSize="sm" 
//                     p={2} 
//                     borderRadius="md"
//                     display="flex"
//                     alignItems="center"
//                     gap={1}
//                 >
//                     <IoDiamond />
//                     Diamond Security - Files will be encrypted
//                 </Badge>
//             )}
            
//             {isGoldBridge && (
//                 <Badge 
//                     colorScheme="yellow" 
//                     variant="surface" 
//                     fontSize="sm" 
//                     p={2} 
//                     borderRadius="md"
//                     display="flex"
//                     alignItems="center"
//                     gap={1}
//                 >
//                     <GiGoldBar />
//                     Gold Security - Standard upload
//                 </Badge>
//             )}

//             {/* Upload Button */}
//             <Button 
//                 className='trigger' 
//                 onClick={handleUpload}
//                 disabled={uploading || acceptedFiles.length === 0}
//                 loading={uploading}
//                 loadingText={isDiamondBridge ? "Encrypting & Uploading..." : "Uploading..."}
//                 colorScheme={isDiamondBridge ? "purple" : "blue"}
//             >
//                 {isDiamondBridge ? "Encrypt & Upload" : "Upload"}
//             </Button>

//             {/* File Progress Display */}
//             {acceptedFiles.map((file) => (
//                 <VStack key={file.name} w="100%" align="stretch">
//                     <HStack justify="space-between">
//                         <Text fontSize="sm" isTruncated maxW="200px">
//                             {file.name}
//                         </Text>
//                         <HStack>
//                             <Text fontSize="xs" color="gray.500">
//                                 {uploadProgress[file.name] || 0}%
//                             </Text>
//                             {uploadProgress[file.name] === 100 && (
//                                 <BiCheckCircle color='green' />
//                             )}
//                         </HStack>
//                     </HStack>
                    
//                     {/* Progress Bar */}
//                     {uploading && (
//                         <div style={{
//                             width: '100%',
//                             height: '4px',
//                             backgroundColor: '#e2e8f0',
//                             borderRadius: '2px',
//                             overflow: 'hidden'
//                         }}>
//                             <div style={{
//                                 width: `${uploadProgress[file.name] || 0}%`,
//                                 height: '100%',
//                                 backgroundColor: isDiamondBridge ? '#805ad5' : '#3182ce',
//                                 transition: 'width 0.3s ease'
//                             }} />
//                         </div>
//                     )}
//                 </VStack>
//             ))}

//             {/* Encryption Status */}
//             {isDiamondBridge && uploading && (
//                 <Text fontSize="xs" color="purple.500" textAlign="center">
//                     🔒 Encrypting files before upload...
//                 </Text>
//             )}
//         </>
//     )
// }