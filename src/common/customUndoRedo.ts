interface Stack {
  undoStack: string[];
  redoStack: string[];
  lastSavedContent: string;
}

export const noteStacks: Record<string, Stack> = {};


export const pushTimeouts: Record<string, NodeJS.Timeout | null> = {};
let isUndoRedoOperation = false;
export const _test_setIsUndoRedo = (val: boolean) => {
  isUndoRedoOperation = val;
};
export const normalize = (html: string) =>
  html
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const saveSelection = (editor: any) => editor.selection.getBookmark(2);
const restoreSelection = (editor: any, bookmark: any) =>
  editor.selection.moveToBookmark(bookmark);

export const initUndoRedo = (noteId: string, initialContent: string) => {
  const content = initialContent || "";

  if (pushTimeouts[noteId]) {
    clearTimeout(pushTimeouts[noteId]!);
    pushTimeouts[noteId] = null;
  }

  if (!noteStacks[noteId]) {
    noteStacks[noteId] = {
      undoStack: [content],
      redoStack: [],
      lastSavedContent: content,
    };
  } else {
    const normalized = normalize(content);
    const existingTop = normalize(
      noteStacks[noteId].undoStack[noteStacks[noteId].undoStack.length - 1] ||
        ""
    );

    if (normalized !== existingTop) {
      noteStacks[noteId] = {
        undoStack: [content],
        redoStack: [],
        lastSavedContent: content,
      };
    } else {
      noteStacks[noteId].lastSavedContent = content;
    }
  }
};

export const pushSnapshot = (noteId: string, content: string) => {
  if (isUndoRedoOperation) {
    return;
  }

  if (pushTimeouts[noteId]) clearTimeout(pushTimeouts[noteId]!);

  pushTimeouts[noteId] = setTimeout(() => {
    const stack = noteStacks[noteId];
    if (!stack) {
      return;
    }

    const normalizedCurrent = normalize(content);
    const normalizedLast = normalize(stack.lastSavedContent);

    if (normalizedCurrent !== normalizedLast && normalizedCurrent !== "") {
      stack.undoStack.push(content);
      stack.lastSavedContent = content;

      if (stack.undoStack.length > 50) stack.undoStack.shift();

      stack.redoStack = [];
    }
  }, 1000);
};

export const customUndo = (noteId: string, editor: any) => {
  const stack = noteStacks[noteId];
  if (!stack || stack.undoStack.length <= 1) {
    return false;
  }

  isUndoRedoOperation = true;
  const bookmark = saveSelection(editor);

  const current = stack.undoStack.pop();
  if (current) stack.redoStack.push(current);

  const previous = stack.undoStack[stack.undoStack.length - 1];
  if (previous !== undefined) {
    editor.setContent(previous);
    stack.lastSavedContent = previous;
    setTimeout(() => restoreSelection(editor, bookmark), 0);
  }

  setTimeout(() => (isUndoRedoOperation = false), 100);
  return true;
};

export const customRedo = (noteId: string, editor: any) => {
  const stack = noteStacks[noteId];
  if (!stack || stack.redoStack.length === 0) {
    return false;
  }

  isUndoRedoOperation = true;

  const redoContent = stack.redoStack.pop();
  if (redoContent) {
    stack.undoStack.push(redoContent);
    editor.setContent(redoContent);
    stack.lastSavedContent = redoContent;

    setTimeout(() => {
      editor.selection.select(editor.getBody(), true);
      editor.selection.collapse(false);
    }, 0);
  }

  setTimeout(() => (isUndoRedoOperation = false), 100);
  return true;
};

export const clearUndoRedo = (noteId: string) => {
  delete noteStacks[noteId];
  if (pushTimeouts[noteId]) {
    clearTimeout(pushTimeouts[noteId]!);
    delete pushTimeouts[noteId];
  }
};
