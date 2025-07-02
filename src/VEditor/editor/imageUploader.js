import axios from 'axios';

export async function uploadAndInsertImage(editorRef, handleInput, file) {

    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await axios.post('http://localhost:1100/api/save-veditor-image', formData);
        if (res.data.status == 'success') {
            insertImageAtCursor(editorRef, res.data.data.url);
            handleInput();
        }
    } catch (error) {
        console.error('Upload error:', error);
    }

};

const insertImageAtCursor = (editorRef, url) => {

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Inserted image';
    img.style.maxWidth = '100%';

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);

        range.setStartAfter(img);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        editorRef.current?.appendChild(img);
    }
};