import { useEffect, useState } from 'react';
import VEditor from './VEditor/VEditor';
import './app.css';

function App() {
  const [html, setHtml] = useState('');
  useEffect(() => {
    setHtml('<p>Welcome to the custom WYSIWYG editor!</p>');
  }, []);

  const handleConsoleOutput = () => {
    console.log(html);
  };
  return (
    <div className="app-container">
      <div className="editor-card">
        <h1 className="editor-title">Custom WYSIWYG Editor</h1>
        <VEditor 
          onChange={setHtml} 
          value={html} 
          imageHandler={{
            onImageChange:'',
            source:`service`,
            prefix:`service`,
            uploadPath:`services`,
          }}
        />
        <div style={{ textAlign: 'center' }}>
          <button onClick={handleConsoleOutput} className="console-btn">Console Data</button>
        </div>
      </div>
    </div>
  );
}

export default App
