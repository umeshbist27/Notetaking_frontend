import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-300 mt-auto w-full">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} NoteApp. Built with 💻 MERN + Redux-Saga.
      </div>
    </footer>
  );
};

export default Footer;
