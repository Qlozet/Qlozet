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
          className='flex items-center space-x-2'
        >
          <Plus className='h-4 w-4' />
          <span>Add new user</span>
        </Button>
      </div>
      <UserAndPermissionTable handleEdit={handleEdit} />

      <Modal
        show={showAddModal}
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
