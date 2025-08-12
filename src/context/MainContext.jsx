import axios from "axios";
import { createContext, useEffect, useLayoutEffect, useState } from "react";
import { useSearchParams } from "react-router";

// eslint-disable-next-line react-refresh/only-export-components
export const MainContext = createContext(null)

const getCookie = (name) => {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[key] = decodeURIComponent(value);
        return acc;
    }, {});
    return cookies[name] || null; // Return null if the cookie is not found
};

// eslint-disable-next-line react/prop-types
export const MainProvider = ({children}) => {
    const [siteTheme, setSiteTheme] = useState(() => getCookie("theme") || "light")
    const [uploading, setUploading] = useState(false)
    const [uploaded, setUploaded] = useState(false)
    const [uploadResult, setUploadResult] = useState(false)
    const [verified, setVerified] = useState(false)
    const [searchParams] = useSearchParams()
    const [myId] = useState(()=>searchParams.get('key'))
    const [settings, setSettings] = useState(null)
    const [fetched, setFetched] = useState(false)
    const [uploadProgress, setUploadProgress] = useState({});
    const api = import.meta.env.VITE_API
    const storage = import.meta.env.VITE_STORAGE

    const cookieTheme = `theme=${siteTheme}`
    useEffect(()=>{
        document.cookie = cookieTheme
    },[siteTheme,cookieTheme])


    useLayoutEffect(()=>{
        const fetch = async() =>{
            try{

                await axios.get(`${api}/livebridges/link/${myId}`).then((res)=>{
                    if(res.data){
                        setVerified(()=>true)
                        setSettings(()=>res.data)
                    }
                }).then(()=>setFetched(true))
            }catch{
                    setFetched(()=>true)
                    setVerified(()=>false)
            }
        }
        fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    

    useEffect(()=>{
        if(!uploaded) return
            setTimeout(()=>{
                setUploaded(false)
            },5000)
        },[uploaded, setUploaded])
    useEffect(()=>{
        if(!uploadResult) return
            setTimeout(()=>{
                setUploadResult(false)
            },5000)
        },[uploadResult, setUploadResult])

    return(
        <MainContext.Provider value={{
            uploading, setUploading, uploadResult, setUploadResult,
            uploaded, setUploaded, siteTheme, setSiteTheme, verified,
            settings, fetched, uploadProgress, setUploadProgress,
            storage, api
            }}>
            {children}
        </MainContext.Provider>
    )
}

