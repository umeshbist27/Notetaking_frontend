import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAddNotes } from "../reactQuery/notes/useAddNotes";
import { useEditNote } from "../reactQuery/notes/useEditNote";
import { useDeleteNote } from "../reactQuery/notes/useDeleteNote";
import { useFetchNotes } from "../reactQuery/notes/useFetchNotes";
import { NavigateFunction } from "react-router-dom";
import { INote } from "../types/note";
import { NewNote } from "../types/newNote";

export const useNoteHandlers = (navigate: NavigateFunction) => {
  const { data: notes = [] } = useFetchNotes();
  const addNoteMutation = useAddNotes();
  const editNoteMutation = useEditNote();
  const deleteNoteMutation = useDeleteNote();
  const [activeNote, setActiveNote] = useState<NewNote | INote | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (!notes || notes.length === 0) {
      setActiveNote(null);
      return;
    }

    const validNotes = notes.filter((note) => note && note._id);
    const sortedNotes = [...validNotes].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    if (!activeNote || !activeNote._id) {
      setActiveNote(sortedNotes[0] || null);
    } else {
      const currentNote = sortedNotes.find((n) => n._id === activeNote._id);
      if (!currentNote) {
        setActiveNote(sortedNotes[0] || null);
      } else if (
        currentNote.title !== activeNote.title ||
        currentNote.content !== activeNote.content
      ) {
        setActiveNote(currentNote);
      }
    }
  }, [notes]);

  const handleDelete = (id: any) => {
    if (id) {
      deleteNoteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Note deleted successfully");
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
        },
      });
    }
  };

  const handleSaveNote = (noteData: INote | NewNote) => {
    if (!noteData.title.trim() && !noteData.content.trim()) {
      return;
    }

    if (noteData._id != null) {
      editNoteMutation.mutate({
        id: noteData._id,
        note: {
          title: noteData.title,
          content: noteData.content,
          imageUrl: noteData.imageUrl,
        },
      });
    } else {
      addNoteMutation.mutate({
        title: noteData.title,
        content: noteData.content,
        imageUrl: noteData.imageUrl,
      });
    }
  };

  const handleSelectNote = (note: INote | NewNote) => {
    setActiveNote(note);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleAddNote = () => {
    const newNote = {
      _id: null,
      title: "",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: "",
    };
    setActiveNote(newNote);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleOverlayClick = () => setIsSidebarOpen(false);

  return {
    notes: notes || [],
    activeNote,
    isSidebarOpen,
    handleDelete,
    handleSaveNote,
    handleSelectNote,
    handleAddNote,
    toggleSidebar,
    handleOverlayClick,
  };
};
