import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';
import addIcon from '@/public/assets/svg/add-square.svg';
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
          children={
            <span className='flex justify-center items-center'>
              <span>Add new user</span>
              <Image src={addIcon} className='ml-4' />
            </span>
          }
          btnSize='small'
          minWidth='min-w-[14rem]'
          variant='primary'
          clickHandler={() => {
            setShowAddModal(true);
          }}
        />
        <div></div>
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
