import ExportComponent from "../../ExportButton";
import ProductTableItem from "../ProductTableItem";
import defaultImage from "../../../public/assets/image/default.png";
import moreIcon from "../../../public/assets/svg/more.svg";
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

const ProductTable = ({ data, viewDetails, showModal }) => {
  const router = useRouter();

  const [dropdownOption, setDropDownOption] = useState("");
  const [showDropDown, setShowDropDown] = useState(false);

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
              <th className="w-[11%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Product Name
                </div>
              </th>
              <th className="w-[10%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Product price
                </div>
              </th>
              <th className="w-[8%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Category
                </div>
              </th>
              <th className="w-[8%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Product type
                </div>
              </th>
              <th className="w-[6%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Tag
                </div>
              </th>
              <th className="w-[9%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Quantity
                </div>
              </th>
              <th className="w-[9%] px-2 py-4 text-[12px]">
                <div className="flex items-center justify-start font-[500]  text-dark">
                  Product Status
                </div>
              </th>
              <th className="w-[8%] px-2 py-4 text-[12px]">
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
                  setDropDownOption(item);
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
        {" "}
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
        <div>
          <div>
            <div className="flex items-center justify-between">
              <Image
                src={defaultImage}
                alt=""
                className="w-[5rem] h-[5rem] rounded-[12px]"
              />
              <div className="relative">
                <Image
                  src={moreIcon}
                  alt=""
                  className="cursor-pointer "
                  onClick={() => {
                    setShowDropDown(true);
                  }}
                />
                {showDropDown && (
                  <div className="absolute right-[0rem] top-[2rem]">
                    <ProductItemDropDown
                      handleSelect={() => {
                        setShowDropDown(false);
                      }}
                      data={[
                        "View product",
                        "Edit product",
                        "Feature product",
                        "Activate product",
                        "Schedule activation",
                        "Deactivate product",
                        "Delete product",
                      ]}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1 mt-2">
                  <Typography
                    textColor="text-gray-100"
                    textWeight="font-normal"
                    textSize="text-[12px]"
                  >
                    Product
                  </Typography>
                  <Typography
                    textColor="text-dark"
                    textWeight="font-normal"
                    textSize="text-[14px]"
                  >
                    Hakeem Mensah
                  </Typography>
                </div>
                <div className="flex flex-col gap-1 mt-2 items-end">
                  <Typography
                    textColor="text-gray-100"
                    textWeight="font-normal"
                    textSize="text-[12px]"
                  >
                    Category
                  </Typography>
                  <Typography
                    textColor="text-dark"
                    textWeight="font-normal"
                    textSize="text-[14px]"
                  >
                    Gown
                  </Typography>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1 mt-2">
                  <Typography
                    textColor="text-gray-100"
                    textWeight="font-normal"
                    textSize="text-[12px]"
                  >
                    Quantity
                  </Typography>
                  <Quantity />
                </div>
                <div className="flex flex-col gap-1 mt-2 items-end justify-center">
                  <Typography
                    textColor="text-gray-100"
                    textWeight="font-normal"
                    textSize="text-[12px]"
                  >
                    Status
                  </Typography>
                  <OrderStatus
                    text="Active"
                    bgColor="bg-success-300"
                    color="text-success"
                    addMaxWidth={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {dropdownOption === "Delete product" && (
        <Modal
          content={
            <div className="flex items-center justify-center h-[100%] ">
              <DeleteProduct logoutFunction={() => {}} />
            </div>
          }
        />
      )}
      {dropdownOption === "Schedule activation" && (
        <Modal
          content={
            <div className="flex items-center justify-center h-[100%] ">
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
