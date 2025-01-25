import AddQuantity from "../Quantity";
import Variant from "../Variant";
import Image from "next/image";
import trashGray from "../../../public/assets/svg/trash-gray.svg";
import Size from "@/components/Size.js";
import VariantImage from "@/components/Products/VariantImage";
import PriceComp from "../PriceComponent";
import CheckBoxInput from "@/components/CheckboxInput";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
const VariantTableItem = ({
    item,
    index,
    quantityHandler,
    submitImage,
    priceHandler,
    handleChecked,
    handleDeleteVariantFromTable,
    data
}) => {
    const [showSizes, setShowSizes] = useState(false)
    return (
        <div className="px-4 ">
            <div className="w-full  py-4 flex items-center justify-between  min-w-[1000px] gap-x-4">
                <div className="flex w-[15%] gap-2 items-center justify-start font-medium text-dark ">
                    <Variant bg={data.data[0].color && data.data[0].color} />
                    <button onClick={() => setShowSizes(!showSizes)}>
                        {showSizes ? (<ChevronUp />) : (<ChevronDown />)}
                    </button>
                </div>
                <div className="flex items-center justify-start w-[15%] font-medium text-dark">
                    <AddQuantity
                        quantityHandler={quantityHandler}
                        quantity={data.data[0].quantity}
                        listIndex={index}
                    />
                </div>
                <div className="flex items-center justify-start font-medium text-dark w-[15%]">
                    <PriceComp
                        id={null}
                        color={data.data[0].color}
                        productAmount={data.data[0].price}
                        priceHandler={priceHandler}
                    />
                </div>
                <div className="flex items-center justify-start gap-2 font-medium text-dark w-[33%] ">
                    {data.data.map((sizeItem) => (
                        <Size value={sizeItem.size} />
                    ))}

                </div>
                <div className="flex items-center justify-between font-medium text-dark w-[29%]">
                    <VariantImage
                        source={data.data[0].images.retained[0] ? data.data[0].images.retained[0].secure_url : ""}
                        id={data.data[0].id}
                        imageIndex={0}
                        submitImage={submitImage}
                        color={data.data[0].color}
                    />
                    <VariantImage
                        source={data.data[0].images.retained[1] ? data.data[0].images.retained[1].secure_url : ""}

                        id={data.data[0].id}
                        imageIndex={1}
                        submitImage={submitImage}
                        color={data.data[0].color}
                    />
                    <VariantImage
                        source={data.data[0].images.retained[2] ? data.data[0].images.retained[2].secure_url : ""}
                        id={data.data[0].id}
                        imageIndex={2}
                        submitImage={submitImage}
                        color={data.data[0].color}
                    />
                    <VariantImage
                        source={data.data[0].images.retained[3] ? data.data[0].images.retained[3].secure_url : ""}
                        id={data.data[0].id}
                        imageIndex={3}
                        submitImage={submitImage}
                        color={data.data[0].color}
                    />
                    <VariantImage
                        source={data.data[0].images.retained[4] ? data.data[0].images.retained[4].secure_url : ""}
                        id={data.data[0].id}
                        imageIndex={4}
                        submitImage={submitImage}
                        color={data.data[0].color}
                    />
                </div>
                <div className="flex items-center justify-start font-medium text-dark w-[4%]">
                    <div className="flex w-[100%] justify-between px-2">
                        <div>
                            <CheckBoxInput
                                handleChange={(value) => {
                                    handleChecked(value, null, data.name);
                                }}
                                value={data.data[0].checked}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end font-medium text-dark w-[4%] h-10 ">
                    <div className="w-7 h-7 flex items-center justify-end">
                        <button
                            className="hover:bg-gray-300 rounded-sm w-full h-full flex items-center justify-center"
                            onClick={() => {
                                handleDeleteVariantFromTable(null, data.name, null);
                            }}
                        >
                            <Image src={trashGray} alt="" width={20} height={20} />
                        </button>
                    </div>
                </div>
            </div>
            {showSizes && (<div className="px-4 bg-[#EBEBEB]  min-w-[1000px]">
                <div className="w-full pt-2 flex items-center justify-between  min-w-[1000px]">
                    <div className="flex w-[25%] items-center justify-start font-medium text-dark ">
                        Size
                    </div>
                    <div className="flex items-center justify-start w-[25%] font-medium text-dark">
                        Quantity
                    </div>
                    <div className="flex items-center justify-start font-medium text-dark w-[25%]">
                        Price
                    </div>

                    <div className="flex items-center justify-start font-medium text-dark w-[4%]"></div>
                    <div className="flex items-center justify-start font-medium text-dark w-[4%]"></div>
                </div>
                {data.data.map((subItem) => (
                    <div className="w-full pb-4 flex items-center justify-between min-w-[1000px] gap-x-4 bg-[#EBEBEB]">
                        <div className="flex w-[25%] gap-2 items-center justify-start font-medium text-dark ">
                            <Size value={subItem.size} borderColor="border-primary" />
                        </div>
                        <div className="flex items-center justify-start w-[25%] font-medium text-dark">
                            <AddQuantity
                                quantityHandler={quantityHandler}
                                quantity={subItem.quantity}
                                listIndex={index}
                                borderColor="border-primary"
                            />
                        </div>
                        <div className="flex items-center justify-start font-medium text-dark w-[25%]">
                            <PriceComp
                                id={subItem.id}
                                color={subItem.color}
                                productAmount={subItem.price}
                                priceHandler={priceHandler}
                                borderColor="border-primary"
                            />
                        </div>
                        {/* <div className="flex items-center justify-between font-medium text-dark w-[33%] ">
                            <Size value={item.size} /> <Size value={item.size} />{" "}
                            <Size value={item.size} /> <Size value={item.size} />{" "}
                            <Size value={item.size} />
                        </div>
                        <div className="flex items-center justify-between font-medium text-dark w-[29%]">
                            <VariantImage
                                id={item.id}
                                imageIndex={0}
                                submitImage={submitImage}
                                color={item.color}
                            />{" "}
                            <VariantImage
                                id={item.id}
                                imageIndex={1}
                                submitImage={submitImage}
                                color={item.color}
                            />
                            <VariantImage
                                id={item.id}
                                imageIndex={2}
                                submitImage={submitImage}
                                color={item.color}
                            />{" "}
                            <VariantImage
                                id={item.id}
                                imageIndex={3}
                                submitImage={submitImage}
                                color={item.color}
                            />{" "}
                            <VariantImage
                                id={item.id}
                                imageIndex={4}
                                submitImage={submitImage}
                                color={item.color}
                            />
                        </div> */}
                        <div className="flex items-center justify-start font-medium text-dark w-7">
                            <div className="flex w-[100%] justify-between px-2">
                                <div>
                                    <CheckBoxInput
                                        handleChange={(data) => {
                                            handleChecked(data, subItem.id, subItem.color);
                                        }}
                                        value={subItem.checked}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end font-medium text-dark w-7 h-10 ">
                            <div className="w-7 h-full flex items-center justify-end">
                                <button
                                    className="hover:bg-gray-300 rounded-sm w-7 h-7 flex items-center justify-center "
                                    onClick={() => {
                                        handleDeleteVariantFromTable(subItem.id, subItem.color, subItem.size);
                                    }}
                                >
                                    <Image src={trashGray} alt="" width={20} height={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>)}


        </div>
    );
};

export default VariantTableItem;
