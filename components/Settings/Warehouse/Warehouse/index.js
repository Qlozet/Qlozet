import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "../../../Button";
import WearhousetTable from "../WarehouseTable";
import addIcon from "../../../../public/assets/svg/add-square.svg";
import Modal from "../../../Modal";
import AddNewWarehouseForm from "../AddNewWarehouseForm";
import { getRequest } from "@/api/method";
import Loader from "@/components/Loader";

const Warehouse = () => {
  const [wareHouse, setWareHouse] = useState([
    {
      warehouseName: "Mouka warehouse",
      vendorName: "Mouka warehouse",
      warehouseAddress: "14, Jones street, Lagos Nigeria",
      contactName: "2348132205304",
      PhoneNumber: "helloe",
      email: "karlkeller@gmail.com",
      Status: "helloe",
      vendorId: "DEV63016762",
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const closeAddWarehouseModal = () => {
    setShowAddModal(false);
  };

  const getWarehouse = async () => {
    try {
      setPageLoading(true);
      let response = await getRequest("/vendor/warehouse");
      let warehouses = [];
      console.log(response);
      setPageLoading(false);
      if (response.data) {
        response?.data?.data.formattedWarehouses.map((item) => {
          const warehouse = {
            warehouseName: item.warehouseName,
            vendorName: item.vendorName,
            warehouseAddress: item.warehouseAddress,
            contactName: item.contactName,
            email: item.contactEmail,
            Status: item.warehouseStatus,
            vendorId: item.warehouseName,
          };
          warehouses.push(warehouse);
        });
        setWareHouse(warehouses);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getWarehouse();
  }, []);
  return (
    <div>
      {pageLoading ? (
        <Loader small={true}></Loader>
      ) : (
        <div>
          <div className="flex items-center justify-end mb-4">
            <Button
              children={
                <span className="flex justify-center items-center">
                  <span>Add warehouse</span>
                  <Image src={addIcon} className="ml-4" alt="" />
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

          <WearhousetTable data={wareHouse} />
          {showAddModal && (
            <Modal
              content={
                <AddNewWarehouseForm closeModal={closeAddWarehouseModal} />
              }
            ></Modal>
          )}
        </div>
      )}
    </div>
  );
};

export default Warehouse;
