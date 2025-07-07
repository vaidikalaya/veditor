# Custom WYSIWYG Editor (React + Vite)

A modern, customizable WYSIWYG (What You See Is What You Get) rich text editor built with React and Vite. Includes a toolbar for formatting, image upload and resizing, HTML/code view, and more.

## Features

- **Rich Text Editing**: Bold, italic, underline, code, headings, lists, alignment, color, and more
- **Image Upload & Resize**: Upload images and resize them with a popup
- **HTML/Console View**: Toggle between WYSIWYG and raw HTML view
- **Customizable Toolbar**: Easily extend or modify toolbar actions
- **Keyboard Shortcuts**: Enhanced editing experience
- **Responsive Design**: Looks great on desktop and mobile

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the app.

## Usage

- Start typing in the editor area.
- Use the toolbar to format text, insert images, lists, etc.
- Click the "Console Data" button to log the current HTML content to the console.
- Click the code/HTML icon in the toolbar to toggle raw HTML view.
- Click on an image to resize it using the popup.

## Project Structure

```
src/
  App.jsx           # Main app component
  app.css           # App-level styles
  VEditor/
    VEditor.jsx     # WYSIWYG editor component
    editor.css      # Editor-specific styles
    components/     # Toolbar, icons, dropdowns
    editor/         # Editor actions, image uploader, modules
```

## Customization

- Modify `src/VEditor/components/Toolbar.jsx` to add or remove toolbar actions.
- Update styles in `src/app.css` and `src/VEditor/editor.css`.
- Extend editor logic in `src/VEditor/editor/` as needed.

## License

MIT
