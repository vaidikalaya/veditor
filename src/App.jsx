import { useState } from 'react'
import VEditor from './VEditor/VEditor'

function App() {
  return (
    <>
      <div className='container'>
        <h1 className='text-2xl text-bold'>Custom WYSIWYG Editor</h1>
        <VEditor />
      </div>
    </>
  )
}

export default App
