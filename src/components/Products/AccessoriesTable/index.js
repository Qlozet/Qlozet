import ExportComponent from "../../ExportButton";
import ProductTableItem from "../ProductTableItem";
import Image from "next/image";
import SearchInput from "@/components/SearchInput";
import icon from "@/public/assets/svg/Icon container.svg";
import exportIcon from "@/public/assets/svg/Content.svg";
import Modal from "@/components/Modal";
import DeleteProduct from "../Delete";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShecduleProduct from "../ScheduleProduct";
import { getProductId } from "@/utils/localstorage";
import MobileTable from "../mobileTable";
import { putRequest } from "@/api/method";
import Toast from "@/components/ToastComponent/toast";
import toast from "react-hot-toast";
import { handleExport } from "@/utils/helper";
import DropDown from "@/components/DropDown";
import Typography from "@/components/Typography";

const AccessoriesTable = ({
  data,
  showModal,
  statusChangeHandler,
  handleFilterData,
  handleFilterWithDate
}) => {
  const [productData, setProductData] = useState(data);
  const router = useRouter();
  const [dropdownOption, setDropDownOption] = useState("");
  const toggleStatus = async () => {
    const productId = getProductId();
    try {
      const response = await putRequest(`/vendor/products/${productId}/toggle`);
      response && statusChangeHandler();
      if (response?.data) {
        toast(<Toast text={response?.message} type="success" />);
      } else {
      }
    } catch (error) { toast(<Toast text={"An error occured"} type="danger" />); }
  };

  useEffect(() => {
    setProductData(data);
  }, [data]);
  return (
    <div className="mt-4 min-h-[50vh]  rounded-xl mb-8" style={{
      zIndex: -1,
    }} >
      <div className="hidden lg:block ">
        <table className="w-full ">
          <thead className="w-full bg-[#F4F4F4] text-dark rounded-[12px] " >
            <tr className="">
              <th className="w-[5%] px-2 py-4 text-xs">
                <div className="flex items-center justify-start font-medium text-dark pl-4" >
                  Picture
                </div>
              </th>
              <th className="w-[12%] px-2 py-4 text-xs">
                <div className="flex items-center justify-start font-medium  text-dark">
                  Product Name
                </div>
              </th>
              <th className="w-[12%] px-2 py-4 text-xs">
                <div className="flex items-center justify-start font-medium  text-dark">
                  Product price
                </div>
              </th>
              <th className="w-[8%] px-2 py-4 text-xs">
                <div className="flex items-center justify-start font-medium  text-dark">
                  Category
                </div>
              </th>
              <th className="w-[10%] px-2 py-4 text-xs">
                <div className="flex items-center justify-start font-medium  text-dark">
                  Product type
                </div>
              </th>
              <th className="w-[4%] px-2 py-4 text-xs">
                <div className="flex items-center justify-start font-medium  text-dark">
                  Tag
                </div>
              </th>
              <th className="w-[9%] px-2 py-4 text-xs">
                <div className="flex items-center justify-start font-medium  text-dark">
                  Quantity
                </div>
              </th>
              <th className="w-[12%] px-2 py-4 text-xs">
                <div className="flex items-center justify-start font-medium  text-dark">
                  Product Status
                </div>
              </th>
              <th className="w-[12%] px-2 py-4 text-xs">
                <ExportComponent
                  handleExport={() => {
                    handleExport(data);
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {productData.map((item, index) => {

              return (
                <ProductTableItem
                  key={index}
                  {...item}
                  viewDetails={showModal}
                  handleSelect={(option) => {
                    setDropDownOption(option);
                    if (option === "View product") {
                      router.push("/details");
                    } else if (option === "Edit product") {
                      router.push("/add");
                    } else if (option === "Deactivate product") {
                      if (item.ProductStatus.text === "Inactive") {
                      } else {
                        toggleStatus();
                      }
                    } else if (option === "Activate product") {
                      if (item.ProductStatus.text === "Active") {
                      } else {
                        toggleStatus();
                      }
                    }
                  }}
                />
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="block lg:hidden">
        <div className="flex items-center justify-between ">
          <div className="w-[70%] block">
            <SearchInput
              placeholder="Search"
              setValue={(data) => {
                handleFilterData(data);
              }}
            />
          </div>
          <div className="flex items-center justify-center">
            <Image src={icon} alt="" />
          </div>
          <div className="flex items-center justify-center">
            <div
              className="w-[3rem] h-[3rem] bg-primary rounded-[12px] flex items-center justify-center"
              onClick={() => {
                handleExport(data);
              }}
            >
              <Image src={exportIcon} alt="" />
            </div>
          </div>
        </div>
        <div className="p-2 flex items-center justify-between mt-4  bg-[#F4F4F4] rounded-t-[12px] ">
          <Typography
            textColor="text-dark"
            textWeight="font-medium"
            textSize="text-[18px]"
          >
            Products
          </Typography>
          <DropDown
            data={[
              "This week",
              "Last week",
              "This month",
              "Last month",
              "Choose month",
              "Custom",
            ]}
            zIndex={1}
            maxWidth={"max-w-[8rem]"}
            placeholder="Time Range"
            setValue={(startDate, endDate, value) => {
              handleFilterWithDate(startDate, endDate);
            }}
          />
        </div>
        {productData.map((item, index) => (
          <MobileTable
            key={index}
            {...item}
            zIndex={productData.length - index}
            handleSelect={(option) => {
              setDropDownOption(option);
              if (option === "View product") {
                router.push("/details");
              } else if (option === "Edit product") {
                router.push("/add");
              } else if (option === "Deactivate product") {
                if (item.ProductStatus.text === "Inactive") {
                } else {
                  toggleStatus();
                }
              } else if (option === "Activate product") {
                if (item.ProductStatus.text === "Active") {
                } else {
                  toggleStatus();
                }
              }
            }}
          />
        ))}
      </div>
      <Modal
        show={dropdownOption === "Delete product" ? true : false}
        content={
          <div className="flex items-center justify-center h-[100%] ">
            {dropdownOption && (<DeleteProduct
              deleteFunction={(productId) => {
                setDropDownOption("");
                setProductData(
                  productData.filter((item) => item.id !== productId)
                );
              }}
            />)}
          </div>
        }
      />




      <Modal
        show={dropdownOption === "Schedule activation" ? true : false}
        content={
          <div className="">
            {dropdownOption && (<ShecduleProduct
              closeSchedule={() => {
                setDropDownOption("");
              }}
            />)}

          </div>
        }
      />
    </div>
  );
};

export default AccessoriesTable;
