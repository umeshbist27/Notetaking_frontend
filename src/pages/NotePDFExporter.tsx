import React, { useState } from "react";
import { MoreVertical, Download, Share2 } from "lucide-react";
import { jsPDF } from "jspdf";

interface NoteActionsMenuProps {
  title: string;
  content: string;
}
const NoteActionsMenu: React.FC<NoteActionsMenuProps> = ({
  title,
  content,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDownload = async () => {
    if (!content) {
      alert("Note content not found!");
      setShowMenu(false);
      return;
    }

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(16);
    doc.text(title || "Untitled Note", 10, y);
    y += 10;

    const div = document.createElement("div");
    div.innerHTML = content;
   /* istanbul ignore next */
    const cleanText = div.textContent || div.innerText || "";

    doc.setFontSize(12);
    const lines = doc.splitTextToSize(cleanText, 180);
    doc.text(lines, 10, y);
    y += lines.length * 7 + 5;

    const images = div.querySelectorAll("img");

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = img.src;

      try {
        const base64 = await fetchImageAsBase64(src);
        if (base64) {
          const imgProps = doc.getImageProperties(base64);
          const pdfWidth = 180;
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          if (y + pdfHeight > 280) {
            doc.addPage();
            y = 20;
          }

          doc.addImage(base64, "JPEG", 10, y, pdfWidth, pdfHeight);
          y += pdfHeight + 5;

          doc.setTextColor("blue");
          doc.setFontSize(10);
          doc.textWithLink(src, 10, y, { url: src });
          doc.setTextColor("black");
          y += 10;
        }
      } catch (err) {
        /* istanbul ignore next */
        console.error("Error adding image:", err);
      }
    }

    doc.save(`${title || "Untitled_Note"}.pdf`);
    setShowMenu(false);
  };

  const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Failed to load image:", url, error);
      return null;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const div = document.createElement("div");
        div.innerHTML = content;

        const cleanText = div.textContent || div.innerText || "";
        const images = div.querySelectorAll("img");
        let shareText = `${title || "Untitled Note"}\n\n${cleanText}`;

        if (images.length > 0) {
          shareText += `\n\nImages:\n`;
          images.forEach((img) => {
            shareText += img.src + "\n";
          });
        }

        await navigator.share({
          title: title || "Untitled Note",
          text: shareText,
        });
      } catch (error) {
        alert("Sharing failed or cancelled.");
      }
    } else {
      alert("Sharing is not supported on this browser.");
    }
    setShowMenu(false);
  };

  const stripHtml = (htmlString: string): string => {
    /* istanbul ignore next */{
 const div = document.createElement("div");
    div.innerHTML = htmlString;
    return div.textContent || div.innerText || "";
    }
   
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu((prev) => !prev);
        }}
        className="hover:text-black"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2  bg-gray-300 border border-gray-200 rounded shadow-lg z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteActionsMenu;
