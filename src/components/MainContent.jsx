import { Box, Text } from '@chakra-ui/react'
import '../App.css'
import UploadUi from './ui/myUi/UploadUi'
import { 
    useContext, 
    // useEffect 
} from 'react'
import { Alert } from './ui/chakraui/alert'
import { MainContext } from '../context/MainContext'
import { IoDiamond } from 'react-icons/io5'
import { GiGoldBar } from 'react-icons/gi'
// import axios from 'axios'


function MainContent() {
    const { uploaded, uploadResult, settings } = useContext(MainContext)
    console.log(settings)
    // console.log(settings)
    
    // useEffect(()=>{
    //             if(settings?.bridge.storageId){
    //                 axios.post(`http://localhost:3001/signedurls/${settings.bridge.storageId}`,{
    //                     fileNames: ['tesing.png', 'niojn.ok', 'iojpjnp.iko']
    //                 }).then((res)=>{
    //                     console.log(res.data)
    //                 })
    //             }
    //         },[settings])
    return (
        <Box className="main">
            <Box className='info'>
                <Text fontSize={'lg'}>{settings.owner}</Text>
                <Text className='headerTitle'>Send files seamlessly using Databridge </Text>
                
                <Box 
                    m={"auto"}
                    display={'flex'} 
                    gap={1} 
                    alignItems={'center'}
                    boxShadow={"0 1px 5px #ccc"}
                    borderRadius={"30px"}
                    p={2}
                    width={"fit-content"}
                    background={"#697565"}
                >
                    {settings.bridge.security === 1?
                    <>
                    <Text color={"#ECDFCC"}>
                        Security Level: Gold
                    </Text>
                    <GiGoldBar color='gold'/>
                    </>
                    :
                    <>
                    <Text color={"#ECDFCC"}>
                        Security Level: Diamond
                    </Text>
                    <IoDiamond color='purple'/>
                    </>
                    }
                </Box>
            </Box>
            {uploaded===false?
            <Box className='uploder'
                data-state="open"
                _open={{
                    animation: "fade-in 300ms ease-out",
                }}
                _close={{
                    animation: "fadeOut 300ms ease-out",
                }}
                
            >
                <UploadUi />
            </Box>
            :
            <Box
                data-state="open"
                _open={{
                animation: "fade-in 300ms ease-out",
                }}
                _close={{
                animation: "fadeOut 300ms ease-out",
            }}
            >
            {
            uploadResult?
            <Alert status="success" variant="surface" title="Files uploaded successfully"/>
            :
            <Alert status="error" variant="surface" title="Error uploading files"/>
            }
        </Box>
        }
        </Box>
    )
}

export default MainContent
