import { useState } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import UserAndPermissionTable from '../UserAndPermissionTable';
import AddNewUserAndPermissionForm from '../AddUserAndPermissionForm';
import { useGetTeamMembersQuery } from '@/redux/services/users/users.api-slice';

const UserAndPermission = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const closeAddModal = () => {
    setShowAddModal(false);
  };

  // Same cached request as the table. Only the owner may manage the team, so
  // anyone else gets a 403 here: explain that instead of an empty table and
  // an Invite button that would only fail.
  const { error } = useGetTeamMembersQuery();
  const notOwner = (error as { status?: unknown } | undefined)?.status === 403;

  if (notOwner) {
    return (
      <div className="bg-card w-full rounded-xl border custom-card-shadow flex flex-col items-center text-center gap-3 px-6 py-12">
        <div className="size-11 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center">
          <ShieldCheck className="size-5 text-primary dark:text-white" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-foreground font-poppins">
          Only the store owner can manage the team
        </h3>
        <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
          Ask the owner if you need someone added, removed or given a different
          role.
        </p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-end mb-4">
        <Button
          onClick={() => setShowAddModal(true)}
          variant="default"
          className="gap-[10px] text-xs! font-medium flex items-center bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-white dark:hover:bg-gray-200 dark:text-black"
        >
          <Plus className="size-[18px]" />
          <span>Invite New Member</span>
        </Button>
      </div>
      <UserAndPermissionTable />

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-[700px] p-0 border-none bg-transparent shadow-none [&>button]:hidden">
          {/* The form renders its own heading, so the dialog's accessible name
              is hidden rather than duplicated. */}
          <DialogTitle className="sr-only">Invite new member</DialogTitle>
          <AddNewUserAndPermissionForm closeModal={closeAddModal} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserAndPermission;
