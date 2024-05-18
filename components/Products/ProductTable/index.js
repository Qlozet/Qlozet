import ExportComponent from "../../ExportButton";
import ProductTableItem from "../ProductTableItem";
import defaultImage from "../../../public/assets/image/default.png";
import Image from "next/image";
import Typography from "@/components/Typography";
import Quantity from "../Quantity";
import OrderStatus from "@/components/order/OrderStatus";
import DropDown from "@/components/DropDown";
import SearchInput from "@/components/SearchInput";
import icon from "../../../public/assets/svg/Icon container.svg";
import exportIcon from "../../../public/assets/svg/Content.svg";
import Modal from "@/components/Modal";
import DeleteProduct from "../Delete";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ShecduleProduct from "../ScheduleProduct";
import ProductItemDropDown from "../ProductItemDropDown";
import { setProductId } from "@/utils/localstorage";
import MobileTable from "../mobileTable";

const ProductTable = ({ data, viewDetails, showModal }) => {
  const router = useRouter();

  const [dropdownOption, setDropDownOption] = useState("");

  return (
    <div className="mt-4 min-h-[50vh] ">
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="w-full bg-[#F4F4F4] text-dark ">
            <tr>
              <th className="w-[5%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Picture
                </div>
              </th>
              <th className="w-[8%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Product Name
                </div>
              </th>
              <th className="w-[12%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Product price
                </div>
              </th>
              <th className="w-[8%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Category
                </div>
              </th>
              <th className="w-[10%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Product type
                </div>
              </th>
              <th className="w-[4%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Tag
                </div>
              </th>
              <th className="w-[9%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Quantity
                </div>
              </th>
              <th className="w-[12%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Product Status
                </div>
              </th>
              <th className="w-[12%] px-2 py-4 text-[12px]">
                <ExportComponent />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <ProductTableItem
                {...item}
                viewDetails={showModal}
                handleSelect={(item) => {
                  console.log(item);
                  setDropDownOption(item);
                  console.log(item);
                  if (item === "View product") {
                    router.push("/products/details");
                  }
                  if (item === "Edit product") {
                    router.push("/products/add");
                  }
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="block md:hidden">
        <div className="flex items-center justify-between ">
          <div className="w-[70%] block">
            <SearchInput placeholder="Search" />
          </div>
          <div className="flex items-center justify-center">
            <Image src={icon} />
          </div>
          <div className="flex items-center justify-center">
            <div className="w-[3rem] h-[3rem] bg-primary rounded-[12px] flex items-center justify-center">
              <Image src={exportIcon} />
            </div>
          </div>
        </div>
        {data.map((item) => (
          <MobileTable
            {...item}
            handleSelect={(item) => {
              setDropDownOption(item);
              console.log(item);
              if (item === "View product") {
                router.push("/products/details");
              }
              if (item === "Edit product") {
                router.push("/products/add");
              }
            }}
          />
        ))}
      </div>
      {dropdownOption === "Delete product" && (
        <Modal
          content={
            <div className="flex items-center justify-center h-[100%] ">
              <DeleteProduct
                deleteFunction={() => {
                  setDropDownOption("");
                }}
              />
            </div>
          }
        />
      )}
      {dropdownOption === "Schedule activation" && (
        <Modal
          content={
            <div className="">
              <ShecduleProduct
                closeSchedule={() => {
                  setDropDownOption("");
                }}
              />
            </div>
          }
        />
      )}
    </div>
  );
};

export default ProductTable;
