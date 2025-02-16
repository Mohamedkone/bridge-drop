import { Box, Text} from '@chakra-ui/react'

import MainContent from './components/MainContent'
import Header from './components/Header'
import Footer from './components/Footer'
import { useContext } from 'react'
import { MainContext } from './context/MainContext'
import NoBridge from './components/NoBridge'

function Bridge() {
    const { verified, fetched } = useContext(MainContext)
    return (
        <>
            {fetched?
            verified?
                <Box className='canvas'>
                <Header />
                <MainContent />
                <Footer />
                </Box>
                :
                <NoBridge />
            
            :
            <Box>
                    <Text>Please Wait...</Text>
            </Box>
            }
        </>
    )
}

export default Bridge
