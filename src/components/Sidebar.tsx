import React, { useState, useEffect, KeyboardEvent } from "react";
import { Plus, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DeletePopup from "../common/DeletePopup";
import { toast } from "react-toastify";
import SearchNote from "../common/SearchNote";
import { INote } from "../types/note";
import NotePDFExporter from "../pages/NotePDFExporter";

interface SidebarProps {
  activeNote: INote | null;
  notes: INote[];
  onDelete: (id: string) => void;
  onAddClick: () => void;
  onNoteClick: (note: INote) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeNote,
  notes,
  onDelete,
  onAddClick,
  onNoteClick,
}) => {
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const [searchTitle, setSearchTitle] = useState("");
  const [filteredNotes, setFilteredNotes] = useState(notes);
  const [searchInputValue, setSearchInputValue] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    /* istanbul ignore next */
    if (e.key == "Enter") {
      setSearchTitle(searchInputValue);
    }
  }

  useEffect(() => {
    const sortedNotes = [...notes].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    if (searchTitle.trim() === "") {
      setFilteredNotes(sortedNotes);
    } else {
      const result = notes.filter((note) =>
        note.title.toLowerCase().includes(searchTitle.toLowerCase())
      );

      setFilteredNotes(result);

      if (result.length === 0) {
        toast.info("Note not matched");
      }
    }
  }, [searchTitle, notes]);

  function handleLogout() {
    const confirmed = window.confirm("You’re about to log out. Continue?");
    if (confirmed) {
      localStorage.removeItem("token");
      toast.success("User Logged Out Successfully");
      navigate("/");
    } else {
      navigate("/notes");
    }
  }

  const handleDelete = (id: any) => {
    onDelete(id);
  };

  function getSidebarPreview(content: string): string {
    const tinyImgs = content.replace(
      /<img([^>]+)>/g,
      '<img $1 style="width:30px; height:25px; display:inline-block; object-fit:cover;" />'
    );
    return tinyImgs;
  }

  return (
    <div className="h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="flex-none p-3 sm:p-4 border-b border-gray-100">
        <h1
          style={{ color: "#3f3f3f" }}
          className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4"
        >
          My Notes
        </h1>

        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-gray-600" />
            <span className="text-sm sm:text-base font-medium text-gray-800 truncate">
              {username}
            </span>
          </div>
          <button
            data-testid="logout-button"
            onClick={handleLogout}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 hover:scale-130
            text-gray-700 rounded-md transition-colors flex-shrink-0 ml-2"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        <button
          style={{ backgroundColor: "#f6f6f6" }}
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-200  text-black rounded-md transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Add Note
        </button>
      </div>

      {notes.length > 0 && (
        <div className="flex-none   px-3 sm:px-4 py-2 sm:py-2.5  border-gray-100">
          <SearchNote
            handleKeyDown={handleKeyDown}
            searchTitle={searchInputValue}
            setSearchTitle={setSearchInputValue}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note: INote) => (
              <div
                onClick={() => onNoteClick(note)}
                key={note._id}
                className={`group cursor-pointer p-3 sm:p-4 hover:opacity-100 hover:bg-[#f2f2f2]
                  ${
                    activeNote && note?._id == activeNote._id
                      ? "opacity-100 bg-[#f2f2f2]"
                      : "bg-[#f7f7f7] opacity-60"
                  }
                  
                transition-all duration-200 hover:shadow-sm`}
              >
                {
                  <div className="flex items-start justify-between gap-2 ">
                    <h3 className="text-xs text-gray-500 mb-0 font-small">
                      {new Date(note.updatedAt)
                        .toLocaleString("en-GB", {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        })
                        .toUpperCase()}
                    </h3>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 ">
                      <NotePDFExporter
                        title={note.title}
                        content={note.content}
                      />
                    </div>
                  </div>
                }

                <div className="flex items-start justify-between gap-2 ">
                  <h3 
                  data-testid="note-title"
                  className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 flex-1 min-w-0">
                    {note.title || (
                      <p className="text-red-400">Untitled Note</p>
                    )}
                  </h3>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 ">
                    <DeletePopup onDelete={() => handleDelete(note._id)} />
                  </div>
                </div>

                <div
                  className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: getSidebarPreview(note.content),
                  }}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <p className="text-gray-500 text-sm sm:text-base mb-2">
                No notes available
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                Create your first note to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
