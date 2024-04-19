import { useState } from "react";
import Image from "next/image";
import Button from "../../../Button";
import WearhousetTable from "../WarehouseTable";
import addIcon from "../../../../../public/assets/svg/add-square.svg";
import Modal from "../../../Modal";
import AddNewWarehouseForm from "../AddNewWarehouseForm";

const Warehouse = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const closeAddWarehouseModal = () => {
    setShowAddModal(false);
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <Button
          children={
            <span className="flex justify-center items-center">
              <span>Add warehouse</span>
              <Image src={addIcon} className="ml-4" />
            </span>
          }
          btnSize="small"
          minWidth="min-w-[14rem]"
          variant="primary"
          clickHandler={() => {
            setShowAddModal(true);
          }}
        />
        <div></div>
      </div>
      <WearhousetTable />
      {showAddModal && (
        <Modal
          content={<AddNewWarehouseForm closeModal={closeAddWarehouseModal} />}
        ></Modal>
      )}
    </div>
  );
};

export default Warehouse;
