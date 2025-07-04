import { customRedo, customUndo } from "./customUndoRedo";
interface BlobInfo {
  blob(): Blob;
  filename(): string;
  id(): string;
  name(): string;
  uri(): string;
}

export const editorInitConfig = (noteId:string)=>({
  menubar: false,
  statusbar: false,
  height: "100%",
  branding: false,

  plugins: [
    "advlist",
    "autolink",
    "lists",
    "link",
    "image",
    "charmap",
    "preview",
    "anchor",
    "searchreplace",
    "visualblocks",
    "code",
    "fullscreen",
    "insertdatetime",
    "table",
    "help",
    "wordcount",
    "emoticons",
    "directionality",
    "pagebreak",
    "nonbreaking",
    "save",
    "codesample",
  ],

  toolbar:
    "customUndo customRedo | styleselect | bold italic underline strikethrough | " +
    "alignleft aligncenter alignright alignjustify | " +
    "bullist numlist outdent indent | link image | " +
    "forecolor backcolor emoticons",

  automatic_uploads: true,

  images_upload_handler: async (blobInfo: BlobInfo): Promise<string> => {
    const formData = new FormData();
    formData.append("image", blobInfo.blob(), blobInfo.filename());

    return fetch("http://localhost:3000/api/auth/notes/upload-image", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((response: Response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data: { imageUrl?: string }) => {
        if (data && data.imageUrl) {
          return data.imageUrl;
        } else {
          throw new Error("Unable to upload image");
        }
      })
      .catch((error: Error) => {
        console.error(error);
        throw new Error("Image upload failed: " + error.message);
      });
  },
  setup: (editor: any) => {
    editor.addCommand("customUndo", () => {
      customUndo(noteId ,editor);
    });
    editor.addCommand("customRedo", () => {
      customRedo(noteId ,editor);
    });
    editor.on("keydown", (e: KeyboardEvent) => {
      /* istanbul ignore next */
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        customUndo(noteId,editor);
        return false;
      }
       /* istanbul ignore next */
      if (
        isCtrlOrCmd &&
        (e.key.toLowerCase() === "y" ||
          (e.key.toLowerCase() === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        e.stopPropagation();
        customRedo(noteId ,editor);
        return false;
      }
    });
    editor.ui.registry.addButton("customRedo", {
      tooltip: "Redo",
      icon: "redo",
      onAction: () => customRedo(noteId ,editor),
    });
    editor.ui.registry.addButton("customUndo", {
      tooltip: "Undo",
      icon: "undo",
      onAction: () => customUndo(noteId ,editor),
    });

    editor.on("init", () => {
      editor.undoManager.clear();
    });
  },

  content_style: `
    html, body, .mce-content-body {
      font-family: Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: black;
      background-color: white;
      margin: 10px;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    html::-webkit-scrollbar,
    body::-webkit-scrollbar,
    .mce-content-body::-webkit-scrollbar {
      display: none;
    }
    *:focus {
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
    }
    body[contenteditable="true"]:focus,
    [contenteditable="true"]:focus,
    [contenteditable]:focus {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
      -webkit-box-shadow: none !important;
      -moz-box-shadow: none !important;
    }
    body {
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
    body#tinymce,
    body[data-id*="tiny-react"],
    body[data-id*="tiny-react"]:focus {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
    }
    img {
      max-width: 100%;
      height: auto;

   
    }
    p {
    margin: 0 0 1em;
    overflow:hidden;
  }
  `,
});
