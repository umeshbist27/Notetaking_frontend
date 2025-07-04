import React from "react";
import { useNavigate } from "react-router-dom";
import { SquareChevronRight, ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";
import NoteEditor from "../editor/NoteEditor";
import { useNoteHandlers } from "../hooks/useNoteHandlers";

const NotesLayout: React.FC = () => {
  const navigate = useNavigate();

  const {
    notes,
    activeNote,
    isSidebarOpen,
    handleDelete,
    handleSaveNote,
    handleSelectNote,
    handleAddNote,
    toggleSidebar,
    handleOverlayClick,
  } = useNoteHandlers(navigate);

  return (
    <div className="flex h-screen bg-white overflow-hidden relative">
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-300 bg-opacity-50 z-40"
          onClick={handleOverlayClick}
        />
      )}

      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-full sm:w-full lg:w-1/4 xl:w-1/5 2xl:w-1/6
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
        bg-gray-200`}
      >
        <Sidebar
          notes={notes}
          activeNote={activeNote}
          onAddClick={handleAddNote}
          onNoteClick={handleSelectNote}
          onDelete={handleDelete}
        />
      </div>

      {isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className={`lg:hidden fixed
               top-2 right-2 mr-2 z-50 p-1.2  border  mt-2 text-gray-700
               bg-gray-200 hover:bg-gray-200 hover:scale-130
               border-white  rounded-md shadow-md `}
        >
          <SquareChevronRight size={15} className="h-4 w-4 text-gray-600" />
        </button>
      )}

      <div className="flex-1 flex flex-col min-w-0 lg:ml-0  bg-white">
        {!isSidebarOpen ? null : <div className="lg:hidden h-16" />}

        <div className="flex-1 overflow-hidden p-2 lg:p-4 sm:mt-1.5">
          {activeNote ? (
            <NoteEditor
              note={activeNote}
              onSave={handleSaveNote}
              rightHeaderContent={
                !isSidebarOpen && (
                  <button
                   data-testid="right-header-toggle"
                    onClick={toggleSidebar}
                    className="p-1 bg-gray-100 border border-gray-300 rounded-md shadow-sm ml-2"
                  >
                    <ArrowLeft size={15} />
                  </button>
                )
              }
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-gray-500 text-lg">
                Select a note to view.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesLayout;
