import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
          className="gap-[10px] text-xs! font-medium flex items-center bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-white dark:hover:bg-gray-200 dark:text-black"
        >
          <Plus className="size-[18px]" />
          <span>Invite New Member</span>
        </Button>
      </div>
      <UserAndPermissionTable handleEdit={handleEdit} />

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-[700px] p-0 border-none bg-transparent shadow-none [&>button]:hidden">
          <AddNewUserAndPermissionForm closeModal={closeAddModal} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserAndPermission;
