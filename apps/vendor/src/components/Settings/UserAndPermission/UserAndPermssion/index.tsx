import { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';
import UserAndPermissionTable from '../UserAndPermissionTable';
import AddNewUserAndPermissionForm from '../AddUserAndPermissionForm';

const UserAndPermission = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleEdit = () => {
    setShowAddModal(true);
  };
  return (
    <div className=''>
      <div className='flex items-center justify-end mb-4'>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="default"
          className="gap-[10px] text-xs! font-medium flex items-center bg-[#5C2D0D] hover:bg-[#4A2409] text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black"
        >
          <Plus className="size-[18px]" />
          <span>Add new user</span>
        </Button>
      </div>
      <UserAndPermissionTable handleEdit={handleEdit} />

      <Modal
        show={showAddModal}
        closeModal={closeAddModal}
        content={
          <>
            {showAddModal && (
              <AddNewUserAndPermissionForm closeModal={closeAddModal} />
            )}
          </>
        }
      ></Modal>
    </div>
  );
};

export default UserAndPermission;
