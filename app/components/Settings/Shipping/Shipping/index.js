import { useState } from "react";
import Image from "next/image";
import Button from "@/app/components/Button";
// import addIcon from "../../../..//public/assets/svg/add-square.svg";
import ShippingTable from "../ShippingTable";

const Shipping = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const closeAddWarehouseModal = () => {
    setShowAddModal(false);
  };

  return (
    <div>
      <ShippingTable />
    </div>
  );
};

export default Shipping;
