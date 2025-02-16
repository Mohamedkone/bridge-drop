"use client"

import {
    Box,
    Code,
    FileUploadHiddenInput,
    FileUploadRootProvider,
    useFileUpload,
} from "@chakra-ui/react"
import { FileUploadList, FileUploadDropzone } from "../chakraui/file-upload"
import UploadTrigger from "./UploadTrigger"
import { Flex } from "@chakra-ui/react"
import { Alert } from "../chakraui/alert"
import { MainContext } from "../../../context/MainContext"
import { useContext } from "react"
// import { Alert } from "../chakraui/alert"

const UploadUi = () => {

    const { uploading } = useContext(MainContext)
    

    const fileUpload = useFileUpload({
        maxFiles: 10,
        maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB limit per file
    })

        // const accepted = fileUpload.acceptedFiles.map((file) => file.name)
        const rejected = fileUpload.rejectedFiles.map((e) => e.file.name)

    return (
        <Flex flexDirection='column' gap={5} >
            <FileUploadRootProvider value={fileUpload} alignItems='center'>
                <FileUploadHiddenInput />
                <FileUploadDropzone
                label="Drag and drop here to upload"
                description="Up to 5GB per file"
                w='calc(min(500px,90dvw))'
                alignItems="center"
                />
                <Box>
                {!uploading && <FileUploadList clearable showSize />}
                </Box>
                {rejected?.length?
            <>
            <Alert status="error" variant="surface" title="Error uploading files" description={"Deas"}/>
            <Code colorPalette="red">rejected: 
            <Box maxW={'calc(min(500px,90dvw))'}>
                {rejected.join(", /\n")}
                </Box>
                </Code>
            </>
            :
            null
            }
            <UploadTrigger /> 
            </FileUploadRootProvider>
            
        </Flex>
    )
}

export default UploadUi
