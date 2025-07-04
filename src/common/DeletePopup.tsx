import React, { FC } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Trash2 } from 'lucide-react';

interface DeletePopupProps {
  onDelete: () => void;
}


const DeletePopup: React.FC<DeletePopupProps> = ({ onDelete }) => {
  const MySwal = withReactContent(Swal);

  const handleDelete = () => {
    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      width:400,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete();
      }
    });
  };

  return (
   <button 
  data-testid="delete-popup" 
  onClick={handleDelete}
  className="rounded"
>
  <Trash2 className="w-4 h-4  hover:scale-130" />
</button>

  );
};

export default DeletePopup;
