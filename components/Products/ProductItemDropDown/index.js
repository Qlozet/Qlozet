import { useEffect, useState, useRef } from "react";

const ProductItemDropDown = ({ data, handleSelect, outSideCLicked }) => {
  const dropDownRef = useRef()
  const [positionTop, setPositionTop] = useState(false);

  const calculatePosition = () => {
    if (dropDownRef.current.getBoundingClientRect().
      bottom < window.innerHeight) {
      setPositionTop(false)
    } else {
      setPositionTop(true)
    }
  }
  useEffect(() => { calculatePosition() }, [])

  return (
    <div className={`absolute right-[4rem] ${positionTop ? "top-0" : "bottom-0"}`} style={{ zIndex: 10 }} ref={dropDownRef}>
      <div
        className={`border-[1px] border-solid border-gray-200 bg-white rounded-[8px] min-w-[12rem]`}
      >
        <div>
          <div className=""></div>
          <div className=" w-full rounded-b-lg ">
            {data.map((item, index) => (
              <div
                key={index}
                className={`hover:bg-gray-400 cursor-pointer text-[14px] p-4 ${index < data.length - 1 &&
                  "border-b-[1px] border-solid border-gray-300"
                  }    ${item === "Deactivate product" || item === "Delete product"
                    ? "text-danger"
                    : "text-dark"
                  }`}
                onClick={() => {
                  handleSelect(item);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItemDropDown;
