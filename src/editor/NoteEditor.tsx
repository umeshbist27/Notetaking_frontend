import React, { useState, useEffect, useRef, useCallback } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { User, Save, Ellipsis } from "lucide-react";
import { editorInitConfig } from "../common/editorInitConfig";
import { INote } from "../types/note";
import { NewNote } from "../types/newNote";
import { toast } from "react-toastify";

import { initUndoRedo, pushSnapshot } from "../common/customUndoRedo";

interface NoteEditorProps {
  note: INote | NewNote;
  onSave: (note: INote | NewNote) => void;
  rightHeaderContent?: React.ReactNode;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  rightHeaderContent,
}) => {
  const editorRef = useRef<any>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>("");
  const lastNoteIdRef = useRef<string | any>(null);

  const [title, setTitle] = useState<string>(note.title || "");
  const [content, setContent] = useState<string>(note.content || "");
  const [showSavedIcon, setShowSavedIcon] = useState<boolean>(false);
  const [hasTyped, setHasTyped] = useState(false);

  const noteId = "_id" in note ? (note._id as string) : "new";

  useEffect(() => {
    const previousNoteId = lastNoteIdRef.current;
    const currentNoteId = noteId;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    setTitle(note.title || "");
    setContent(note.content || "");
    setHasTyped(false);
    if (previousNoteId !== currentNoteId) {
      const initialContent = note.content || "";

      if (editorRef.current) {
        editorRef.current.setContent(initialContent);
      }

      initUndoRedo(currentNoteId, initialContent);
      lastContentRef.current = initialContent;
      lastNoteIdRef.current = currentNoteId;
    } else {
      lastContentRef.current = note.content || "";
    }
  }, [note, noteId]);

  const normalizeContent = (html: string): string => {
    return html
      .replace(/\s*data-mce-[^=]+="[^"]*"/g, "")
      .replace(/\s*style="[^"]*"/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const extractFirstImageUrl = (html: string): string => {
    const match = html.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : "";
  };

  const triggerDebouncedSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const currentContent = editorRef.current?.getContent() || content;

      const formData = {
        title: title.trim(),
        content: currentContent.trim(),
      };

      const normalizedCurrent = normalizeContent(formData.content);
      const normalizedOriginal = normalizeContent(note.content || "");

      const hasChanges =
        formData.title !== (note.title || "").trim() ||
        normalizedCurrent !== normalizedOriginal;

      const isEffectivelyEmpty =
        formData.title === "" && formData.content === "";

      if (hasTyped && hasChanges) {
        /* istanbul ignore next */
        if (isEffectivelyEmpty) {
          return;
        }

        try {
          const imageUrl = extractFirstImageUrl(formData.content);

          const payload: any = {
            ...note,
            title: formData.title,
            content: formData.content,
            imageUrl,
          };

          onSave(payload);
          setShowSavedIcon(true);
          setTimeout(() => setShowSavedIcon(false), 1000);
        } catch (error) {
          toast.error("save failed...");
        }
      }
    }, 500);
  }, [title, content, note, onSave, hasTyped]);

  useEffect(() => {
    if (hasTyped) {
      triggerDebouncedSave();
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, content, triggerDebouncedSave]);

  const handleEditorChange = (newContent: string, editor: any) => {
    setContent(newContent);
    setHasTyped(true);

    const normalizeForComparison = (html: string) => {
      return html
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const normalizedNew = normalizeForComparison(newContent);
    const normalizedLast = normalizeForComparison(lastContentRef.current);

    if (normalizedNew !== normalizedLast && lastNoteIdRef.current === noteId) {
      pushSnapshot(noteId, newContent);
      lastContentRef.current = newContent;
    }
  };

  const handleEditorInit = (evt: any, editor: any) => {
    editorRef.current = editor;

    const initialContent = note.content || "";
    editor.setContent(initialContent);
    lastContentRef.current = initialContent;
  };

  const username = localStorage.getItem("username");

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-none bg-gray-50">
        <div className="flex items-center justify-between p-3 pt-0 bg-white">
          <input
            type="text"
            className="w-full px-3 py-2 text-lg font-semibold text-gray-600 bg-white rounded-lg focus:outline-none"
            placeholder="Note title..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasTyped(true);
            }}
          />
          {rightHeaderContent}
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm ml-2 font-medium text-gray-700 truncate">
              {username}
            </span>
          </div>

          <div className="text-xs">
            <span className="font-medium text-gray-500 mr-2">
              Last Modified:
            </span>
            <span className="text-sm ml-2 font-medium text-gray-700 truncate">
              {note.updatedAt
                ? new Date(note.updatedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        {showSavedIcon && (
          <div data-testid="save-icon" className="absolute top-3 right-3 z-10 mt-9 flex items-center">
            <Save className="text-green-400 w-5 h-5 sm:w-6 sm:h-6" />
            <Ellipsis className="text-green-400 ml-2 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}

        <Editor
          apiKey="6x5yad1sgfmwzkllx1g7m5seiq3g6e637r2wkofvjrvsysvk"
          key={noteId}
          onInit={handleEditorInit}
          value={content}
          onEditorChange={handleEditorChange}
          init={editorInitConfig(noteId)}
        />
      </div>
    </div>
  );
};

export default NoteEditor;
