import { useState } from 'react'
import VEditor from './VEditor/VEditor'

function App() {
  const [html, setHtml] = useState('');
  return (
    <>
      <div>
        <h1>Custom WYSIWYG Editor</h1>
        <VEditor onChange={setHtml} value={html}/>
      </div>
    </>
  )
}

export default App
