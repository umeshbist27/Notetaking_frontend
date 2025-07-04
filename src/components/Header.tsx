import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-gray-800 text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-center items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">📝 NoteApp</Link>
        </h1>
      </div>
    </header>
  );
};

export default Header;
