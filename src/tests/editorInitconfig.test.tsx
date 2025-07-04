import { customRedo, customUndo } from "../common/customUndoRedo";
import { editorInitConfig } from "../common/editorInitConfig";


jest.mock("../common/customUndoRedo", () => ({
  customUndo: jest.fn(),
  customRedo: jest.fn(),
}));

interface BlobInfo {
  blob(): Blob;
  filename(): string;
  id(): string;
  name(): string;
  uri(): string;
}
describe("editorInitConfig", () => {
  let editor: any;
  const noteId = "test-note";

  beforeEach(() => {
    jest.clearAllMocks();

    editor = {
      addCommand: jest.fn(),
      on: jest.fn(),
      ui: {
        registry: {
          addButton: jest.fn(),
        },
      },
      undoManager: {
        clear: jest.fn(),
      },
    };
  });

  it("registers undo and redo commands and buttons, sets up keydown and init handlers", () => {
    const config = editorInitConfig(noteId);

  
    config.setup(editor);

    
    expect(editor.addCommand).toHaveBeenCalledWith(
      "customUndo",
      expect.any(Function)
    );
    expect(editor.addCommand).toHaveBeenCalledWith(
      "customRedo",
      expect.any(Function)
    );

 
    expect(editor.ui.registry.addButton).toHaveBeenCalledWith(
      "customRedo",
      expect.objectContaining({
        onAction: expect.any(Function),
      })
    );
    expect(editor.ui.registry.addButton).toHaveBeenCalledWith(
      "customUndo",
      expect.objectContaining({
        onAction: expect.any(Function),
      })
    );

    
    expect(editor.on).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(editor.on).toHaveBeenCalledWith(
      "init",
      expect.any(Function)
    );

   
   const initHandler = (editor.on.mock.calls.find(
  (call: [string, (...args: any[]) => void]) => call[0] === "init"
) as [string, () => void])[1];

    initHandler();
    expect(editor.undoManager.clear).toHaveBeenCalled();
  });

  it("calls customUndo and customRedo on commands, buttons, and keyboard shortcuts", () => {
    const config = editorInitConfig(noteId);
    config.setup(editor);

    
  const undoCommand = (editor.addCommand.mock.calls.find(
  (call: [string, () => void]) => call[0] === "customUndo"
) as [string, () => void])[1];

const redoCommand = (editor.addCommand.mock.calls.find(
  (call: [string, () => void]) => call[0] === "customRedo"
) as [string, () => void])[1];


    
    undoCommand();
    expect(customUndo).toHaveBeenCalledWith(noteId, editor);

    redoCommand();
    expect(customRedo).toHaveBeenCalledWith(noteId, editor);

   
    const undoButtonConfig = editor.ui.registry.addButton.mock.calls.find(
      (call :[string, () => void]) => call[0] === "customUndo"
    )[1];
    undoButtonConfig.onAction();
    expect(customUndo).toHaveBeenCalledWith(noteId, editor);

    const redoButtonConfig = editor.ui.registry.addButton.mock.calls.find(
      (call:[string, () => void]) => call[0] === "customRedo"
    )[1];
    redoButtonConfig.onAction();
    expect(customRedo).toHaveBeenCalledWith(noteId, editor);

  
    const keydownHandler = editor.on.mock.calls.find(
      (call:[string, () => void]) => call[0] === "keydown"
    )[1];

   const undoEvent = {
  ctrlKey: true,
  metaKey: false,
  key: "z",
  shiftKey: false,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
} as unknown as KeyboardEvent;
    keydownHandler(undoEvent);
    expect(undoEvent.preventDefault).toHaveBeenCalled();
    expect(undoEvent.stopPropagation).toHaveBeenCalled();
    expect(customUndo).toHaveBeenCalledWith(noteId, editor);

    const redoEvent1 = {
      ctrlKey: true,
      metaKey: false,
      key: "y",
      shiftKey: false,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    } as any;
    keydownHandler(redoEvent1);
    expect(redoEvent1.preventDefault).toHaveBeenCalled();
    expect(redoEvent1.stopPropagation).toHaveBeenCalled();
    expect(customRedo).toHaveBeenCalledWith(noteId, editor);

    const redoEvent2 = {
      ctrlKey: true,
      metaKey: false,
      key: "z",
      shiftKey: true,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    } as unknown as KeyboardEvent;
    keydownHandler(redoEvent2);
    expect(redoEvent2.preventDefault).toHaveBeenCalled();
    expect(redoEvent2.stopPropagation).toHaveBeenCalled();
    expect(customRedo).toHaveBeenCalledWith(noteId, editor);
  });

  

});

describe("editorInitConfig images_upload_handler", () => {
  const noteId = "test-note";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue("fake-token");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("uploads image and returns imageUrl on successful fetch", async () => {
    const blobInfo: BlobInfo = {
    blob: () => new Blob(["fake-image-content"], { type: "image/png" }),
    filename: () => "image.png",
    id: () => "id123",
    name: () => "image-name",
    uri: () => "some-uri",
  };

    const mockResponseData = { imageUrl: "http://example.com/image.png" };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponseData),
      } as Response)
    ) as jest.Mock;

    const { images_upload_handler } = editorInitConfig(noteId);
    const result = await images_upload_handler(blobInfo);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/auth/notes/upload-image",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer fake-token",
        },
        body: expect.any(FormData),
      })
    );

    expect(result).toBe(mockResponseData.imageUrl);
  });

  it("throws error if fetch response is not ok", async () => {
    const blobInfo: BlobInfo = {
    blob: () => new Blob(["fake-image-content"], { type: "image/png" }),
    filename: () => "image.png",
    id: () => "id123",
    name: () => "image-name",
    uri: () => "some-uri",
  };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      } as Response)
    ) as jest.Mock;

    const { images_upload_handler } = editorInitConfig(noteId);

    await expect(images_upload_handler(blobInfo)).rejects.toThrow("Network response was not ok");
  });

  it("throws error if imageUrl is missing in response", async () => {
    const blobInfo: BlobInfo = {
    blob: () => new Blob(["fake-image-content"], { type: "image/png" }),
    filename: () => "image.png",
    id: () => "id123",
    name: () => "image-name",
    uri: () => "some-uri",
  };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}), 
      } as Response)
    ) as jest.Mock;

    const { images_upload_handler } = editorInitConfig(noteId);

    await expect(images_upload_handler(blobInfo)).rejects.toThrow("Unable to upload image");
  });

  it("throws error on fetch failure", async () => {
     const blobInfo: BlobInfo = {
    blob: () => new Blob(["fake-image-content"], { type: "image/png" }),
    filename: () => "image.png",
    id: () => "id123",
    name: () => "image-name",
    uri: () => "some-uri",
  };

    global.fetch = jest.fn(() => Promise.reject(new Error("fetch failed"))) as jest.Mock;

    const { images_upload_handler } = editorInitConfig(noteId);

    await expect(images_upload_handler(blobInfo)).rejects.toThrow("Image upload failed: fetch failed");
  });
});