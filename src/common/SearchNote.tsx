import React ,{KeyboardEvent,ChangeEvent} from 'react';
import { Search } from 'lucide-react';


interface SearchNoteProps {
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  searchTitle: string;
  setSearchTitle: (value: string) => void;
}

const SearchNote:React.FC<SearchNoteProps> = ({ handleKeyDown,searchTitle, setSearchTitle }) => {
  return (
    <div style={{backgroundColor:"#f6f6f6"}} className="flex items-center bg-gray-200 rounded px-3 py-3 w-full mb-1">
      <Search className="w-4 h-4 sm:w-5 sm:h-5  mr-2" />
      <input
        type="text"
        placeholder="Search..."
        value={searchTitle}
        onKeyDown={handleKeyDown}
        onChange={(e:ChangeEvent<HTMLInputElement>) => setSearchTitle(e.target.value)}
        className="flex-1 text-xl outline-none"
      />
    </div>
  );
};

export default SearchNote;
