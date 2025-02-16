import { Flex, Heading, Text } from '@chakra-ui/react'
import Header from './Header'

function NoBridge() {
    return (
        <Flex
                    flexDir={'column'} 
                    justifyContent={'space-between'}
                    // alignItems={'center'}
                    minH={"100dvh"}
                >
                    <Header />
                    <Flex 
                    flexDir={'column'} 
                    justifyContent={'center'}
                    alignItems={'center'}
                    // height={"100dvh"}
                    gap={3}
                    flexGrow={1}
                    >
                    <Heading size={'3xl'} textAlign={'center'}>
                        Something Went Wrong
                    </Heading>
                    <Text textAlign={'center'}>
                        Please Verify your link or contact the owner of
                        the Bridge.<br />
                        If the issue persist , please contact us
                    </Text>
                    </Flex>
                </Flex>
)
}

export default NoBridge
