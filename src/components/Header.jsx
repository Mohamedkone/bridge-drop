import { Box, Button } from "@chakra-ui/react"
import { Switch } from "./ui/chakraui/switch"
import { FiMoon, FiSun } from "react-icons/fi";
import { useContext } from "react";
import { MainContext } from "../context/MainContext";
import Logo from "../assets/logo.svg"
function Header() {
    const { siteTheme, setSiteTheme } = useContext(MainContext)

    const handleme = (e) =>{
        if(e.checked) setSiteTheme('light')
        else setSiteTheme('dark')
    }

    return (
        <Box className="header">
            <Box>
                <img src={Logo} alt="lockbridge logo" width={"50px"} style={{boxShadow:"0 1px 5px 5px #fff", background:"#fff"}} />
            </Box>
            <Box className="themeSwitch">
                <Switch
                    checked={siteTheme === "light"? true : false}
                    colorPalette="blue"
                    size="lg"
                    onCheckedChange={(e)=>handleme(e)}
                    trackLabel={{
                        on: (
                            <Box as={FiSun} color="yellow.400" />
                            
                        ),
                        off: (
                            <Box as={FiMoon} color="blue.400" /> 
                        ),
                    }}
                />
            </Box>
            <Box>
                <Button className="signIn" variant={"outline"}>Sign In</Button>
            </Box>
        </Box>
    )
}

export default Header
