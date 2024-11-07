import { useState } from "react";
import Image from "next/image";
import Button from "../../../Button";
import addIcon from "../../../../public/assets/svg/add-square.svg";
import Modal from "../../../Modal";
import CategoryTable from "../Table";
import RequestCategoryForm from "../RequestANewProductcategoryForm";
const Category = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleEdit = () => {
    setShowAddModal(true);
  };
  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <Button
          children="Request new category"
          btnSize="small"
          minWidth="min-w-[14rem]"
          variant="primary"
          clickHandler={() => {
            setShowAddModal(true);
          }}
        />
        <div></div>
      </div>
      <CategoryTable handleEdit={handleEdit} />
        <Modal
          show={showAddModal}
        content={<>{showAddModal && (<RequestCategoryForm closeModal={closeAddModal} />)}</>}
        ></Modal>
    </div>
  );
};

export default Category;
