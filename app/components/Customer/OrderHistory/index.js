import OrderDetailNav from "../../order/OrderdetailsNav";
import defaultImage from "../../../../public/assets/image/default.png";
import Image from "next/image";
import Button from "../../Button";
import HistoryTable from "../HistoryTable";
const OrderHistory = ({ topNavData, closeModal }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full mt-6">
      <OrderDetailNav
        active="Order history"
        data={topNavData}
        closeModal={closeModal}
        width="w-[60%]"
      />
      <div className="w-[60%]">
        <HistoryTable />
      </div>
      <div className="bg-white flex items-center justify-end w-[60%] rounded-b-[12px] px-4 py-8">
        <Button
          children="Submit"
          btnSize="large"
          variant="primary"
          clickHandler={() => {}}
          maxWidth="max-w-[12rem]"
        />
      </div>
    </div>
  );
};
export default OrderHistory;
