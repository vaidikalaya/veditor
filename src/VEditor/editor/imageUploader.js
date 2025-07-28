import axios from 'axios';

export async function uploadAndInsertImage(editorRef, handleInput, file, imageHandler='') {

    const formData = new FormData();
    formData.append('image', file);

    try {
        let imageURL='';
        let res='';
        if(imageHandler.onImageChange){
            res=imageHandler.onImageChange(formData);
            imageURL=res.url;
        }
        else{
            formData.append('source', imageHandler.source);
            formData.append('upload_path', imageHandler.uploadPath);
            formData.append('prefix', imageHandler.prefix);
            res = await axios.post(API, formData);
            imageURL=res.data.data.url
        }
        if (imageURL) {
            insertImageAtCursor(editorRef,imageURL);
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