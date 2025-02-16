import { useFileUploadContext } from '@chakra-ui/react'
import { useEffect } from 'react'

export default function useCheckFileList() {
  const { acceptedFiles } = useFileUploadContext()

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      console.log('Accepted Files:', acceptedFiles)
    }
  }, [acceptedFiles])

  // Return acceptedFiles for other potential usages
  return acceptedFiles
}
