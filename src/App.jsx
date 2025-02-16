import {  Theme } from '@chakra-ui/react'

import { useContext } from 'react'
import { MainContext } from './context/MainContext'
import { Route, Routes } from 'react-router'
import Bridge from './Bridge'

function App() {
  const { siteTheme } = useContext(MainContext)
  // useEffect( ()=>{
  //   async function test (){
  //     const response =  await fetch('http://localhost:3000/list-files', {
  //       method: 'GET',
  //     })
  //     const tes = await response.json()
  //     console.log(tes)
  //   }
  //   test()

  // },[])
  // useEffect( ()=>{
  //   async function test (){

  //     const response =  await fetch('http://localhost:3000/presign-download?key=app.js', {
  //       method: 'GET',
  //     })
  //     const tes = await response.json()
  //     const downloadme = await fetch(tes.url,{
  //       method: 'GET'
  //     })
  //     if (!downloadme.ok) {
  //       throw new Error('Failed to fetch the file');
  //     }

  //     const blob = await downloadme.blob(); // Get file as Blob
  //     const link = document.createElement('a');
  //     link.href = URL.createObjectURL(blob); // Create a Blob URL
  //     link.download = "app.js"; // Use the original file key as the download name
  //     link.click();
  //   }
  //   test()

  // },[])
  return (
    <Theme appearance={siteTheme}>
      <Routes>
        <Route index element={<Bridge />} />
      </Routes>
    </Theme>
  )
}

export default App
