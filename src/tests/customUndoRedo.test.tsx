import {
  noteStacks,
  pushTimeouts,
  _test_setIsUndoRedo as setIsUndoRedo,
  normalize,
  initUndoRedo,
  pushSnapshot,
  customUndo,
  customRedo,
  clearUndoRedo,
} from "../common/customUndoRedo";

jest.useFakeTimers();

const noteId = "note1";
const createMockEditor = () => {
  let content = "";
  return {
    selection: {
      getBookmark: jest.fn(() => "bookmark"),
      moveToBookmark: jest.fn(),
      select: jest.fn(),
      collapse: jest.fn(),
    },
    setContent: jest.fn((newContent) => (content = newContent)),
    getBody: jest.fn(() => "body"),
  };
};

describe("customUndoRedo module", () => {
  beforeEach(() => {
    clearUndoRedo(noteId);
    jest.clearAllTimers();
    setIsUndoRedo(false);
  });

  test("normalize should trim and replace spaces and &nbsp;", () => {
    expect(normalize("  hello&nbsp; world  ")).toBe("hello world");
  });

  test("initUndoRedo creates new stack if none exists", () => {
    initUndoRedo(noteId, "initial content");
    expect(noteStacks[noteId]).toBeDefined();
    expect(noteStacks[noteId].undoStack[0]).toBe("initial content");
  });

  test("initUndoRedo resets stack if content changed", () => {
    initUndoRedo(noteId, "content1");
    initUndoRedo(noteId, "content2");
    expect(noteStacks[noteId].undoStack.length).toBe(1);
    expect(noteStacks[noteId].undoStack[0]).toBe("content2");
  });

  test("initUndoRedo maintains stack if content unchanged", () => {
    initUndoRedo(noteId, "same content");
    const firstStack = noteStacks[noteId];
    initUndoRedo(noteId, "same content");
    expect(noteStacks[noteId]).toBe(firstStack);
  });

  test("pushSnapshot returns early if isUndoRedoOperation=true", () => {
    setIsUndoRedo(true);
    pushSnapshot(noteId, "any content");
    expect(pushTimeouts[noteId]).toBeUndefined();
  });

  test("pushSnapshot clears existing timeout and sets new timeout", () => {
    initUndoRedo(noteId, "start");
    pushSnapshot(noteId, "change1");
    expect(pushTimeouts[noteId]).not.toBeNull();
    const oldTimeout = pushTimeouts[noteId];
    pushSnapshot(noteId, "change2");
    expect(pushTimeouts[noteId]).not.toBe(oldTimeout);
  });

  test("pushSnapshot does nothing if no stack found", () => {
    pushSnapshot("nonexistent", "content");
    jest.advanceTimersByTime(1000);
    expect(noteStacks["nonexistent"]).toBeUndefined();
  });

  test("pushSnapshot pushes snapshot if normalized content differs and is not empty", () => {
    initUndoRedo(noteId, "first");
    pushSnapshot(noteId, "second");
    jest.advanceTimersByTime(1000);
    expect(noteStacks[noteId].undoStack.length).toBe(2);
    expect(noteStacks[noteId].lastSavedContent).toBe("second");
  });

  test("pushSnapshot does not push if normalized content equals lastSavedContent", () => {
    initUndoRedo(noteId, "same");
    pushSnapshot(noteId, "same");
    jest.advanceTimersByTime(1000);
    expect(noteStacks[noteId].undoStack.length).toBe(1);
  });

  test("pushSnapshot does not push empty normalized content", () => {
    initUndoRedo(noteId, "something");
    pushSnapshot(noteId, "");
    jest.advanceTimersByTime(1000);
    expect(noteStacks[noteId].undoStack.length).toBe(1);
  });

  test("pushSnapshot shifts undoStack if it exceeds 50 items", () => {
    initUndoRedo(noteId, "init");
    for (let i = 0; i < 51; i++) {
      pushSnapshot(noteId, `content${i}`);
      jest.advanceTimersByTime(1000);
    }
    expect(noteStacks[noteId].undoStack.length).toBe(50);
    expect(noteStacks[noteId].undoStack[0]).toBe("content1");
  });

  test("customUndo returns false if stack missing or undoStack too short", () => {
    expect(customUndo("missingNote", createMockEditor())).toBe(false);
    initUndoRedo(noteId, "only one");
    expect(customUndo(noteId, createMockEditor())).toBe(false);
  });

  test("customUndo correctly undoes and restores selection", () => {
    const editor = createMockEditor();
    initUndoRedo(noteId, "first");
    pushSnapshot(noteId, "second");
    jest.advanceTimersByTime(1000);

    expect(customUndo(noteId, editor)).toBe(true);
    expect(editor.setContent).toHaveBeenCalledWith("first");
    expect(noteStacks[noteId].undoStack.length).toBe(1);
    expect(noteStacks[noteId].redoStack.length).toBe(1);

    jest.runAllTimers();
  });

  test("customRedo returns false if stack missing or redoStack empty", () => {
    expect(customRedo("missingNote", createMockEditor())).toBe(false);
    initUndoRedo(noteId, "init");
    expect(customRedo(noteId, createMockEditor())).toBe(false);
  });

  test("customRedo correctly redoes and sets selection", () => {
    const editor = createMockEditor();
    initUndoRedo(noteId, "start");
    pushSnapshot(noteId, "middle");
    jest.advanceTimersByTime(1000);
    customUndo(noteId, editor);
    jest.runAllTimers();

    expect(customRedo(noteId, editor)).toBe(true);
    expect(editor.setContent).toHaveBeenCalledWith("middle");
    expect(noteStacks[noteId].undoStack.length).toBe(2);
    expect(noteStacks[noteId].redoStack.length).toBe(0);

    jest.runAllTimers();
  });

  test("clearUndoRedo clears stacks and timeouts", () => {
    initUndoRedo(noteId, "content");
    pushSnapshot(noteId, "change");
    clearUndoRedo(noteId);
    expect(noteStacks[noteId]).toBeUndefined();
    expect(pushTimeouts[noteId]).toBeUndefined();
  });
});
