# Custom WYSIWYG Editor (React + Vite)

A modern, customizable WYSIWYG (What You See Is What You Get) rich text editor built with React and Vite. Includes a toolbar for formatting, image upload and resizing, HTML/code view with syntax highlighting, and more.

## Features

- **Rich Text Editing**: Bold, italic, underline, code, headings, lists, alignment, color, and more
- **Image Upload & Resize**: Upload images and resize them with a popup
- **HTML/Console View**: Toggle between WYSIWYG and CodeMirror-powered HTML view with syntax highlighting
- **Code Formatting**: Automatic HTML formatting for clean, readable code
- **Customizable Toolbar**: Easily extend or modify toolbar actions
- **Keyboard Shortcuts**: Enhanced editing experience
- **Responsive Design**: Looks great on desktop and mobile

## Getting Started

### For New Projects

1. Install dependencies
```bash
npm install
```

2. Start the development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the app.

### For Existing Projects

To integrate this WYSIWYG editor into your existing React project:

1. **Install required dependencies**
```bash
npm install @uiw/react-codemirror @uiw/codemirror-theme-dracula @codemirror/lang-html
```

2. **Copy the VEditor folder**
   - Copy the entire `src/VEditor/` folder to your project
   - Ensure all component files, CSS, and editor actions are included

3. **Import and use the editor**
```jsx
import VEditor from './VEditor/VEditor';

function App() {
  const [content, setContent] = useState('');

  return (
    <div>
      <VEditor 
        value={content}
        onChange={(html) => setContent(html)}
      />
    </div>
  );
}
```

4. **Optional: Customize the editor**
   - Modify toolbar actions in `VEditor/components/Toolbar.jsx`
   - Update styles in `VEditor/editor.css`
   - Extend editor functionality in `VEditor/editor/` files

## Usage

- Start typing in the editor area.
- Use the toolbar to format text, insert images, lists, etc.
- Click the "Console Data" button to log the current HTML content to the console.
- Click the code/HTML icon in the toolbar to toggle between WYSIWYG and CodeMirror HTML view.
- In HTML view, you can edit the code directly with syntax highlighting and automatic formatting.
- Click on an image to resize it using the popup.

## Dependencies

The editor uses the following key dependencies:
- `@uiw/react-codemirror`: CodeMirror 6 integration for React
- `@uiw/codemirror-theme-dracula`: Dracula theme for CodeMirror

## Project Structure

```
src/
  App.jsx           # Main app component
  app.css           # App-level styles
  VEditor/
    VEditor.jsx     # WYSIWYG editor component with CodeMirror integration
    editor.css      # Editor-specific styles
    components/     # Toolbar, icons, dropdowns
    editor/         # Editor actions, image uploader, modules
```

## Customization

- Modify `src/VEditor/components/Toolbar.jsx` to add or remove toolbar actions.
- Update styles in `src/app.css` and `src/VEditor/editor.css`.
- Extend editor logic in `src/VEditor/editor/` as needed.
- Change CodeMirror theme by importing different themes from `@uiw/codemirror-theme-*` packages.
- Customize HTML formatting by modifying the `indentHtml` function in `VEditor.jsx`.

## License

MIT
