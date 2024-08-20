import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import Typography from "../Typography";
import arrowLeft from "../../public/assets/svg/arrrowLeft.svg";
import arrowRight from "../../public/assets/svg/arrowRightt.svg";
import closeIcon from "../../public/assets/svg/material-symbols_close-rounded.svg";

const DragDrop = ({ closeModal, productImages, selectedStyles }) => {
  const defaultPosition = selectedStyles.map((item, index) => {
    return {
      id: item.id,
      imageIndex: index,
      position: { left: 0, right: 0, top: 0, bottom: 0 },
      uiLeft: 0,
      uiTop: 0,
    };
  });

  console.log(productImages);
  const imageRef = useRef();
  const itemref = useRef();
  const subRef = useRef();
  const data = [
    {
      asset_id: "d6afe2b799693f827bf55ac805756e43",
      public_id: "ri87pudm2jss5jtbmbw6",
      secure_url:
        "https://res.cloudinary.com/dfnmx7vgc/image/upload/v1723845336/dfkela1w4k0vzuqknqrc.jpg",
    },

    {
      asset_id: "d6afe2b799693f827bf55ac805756e43",
      public_id: "ri87pudm2jss5jtbmbw6",
      secure_url:
        "https://res.cloudinary.com/dfnmx7vgc/image/upload/v1723845383/wbiecjerb3gp5vsu3grd.jpg",
    },
    {
      asset_id: "d6afe2b799693f827bf55ac805756e43",
      public_id: "ri87pudm2jss5jtbmbw6",
      secure_url:
        "https://res.cloudinary.com/dfnmx7vgc/image/upload/v1723845383/wbiecjerb3gp5vsu3grd.jpg",
    },
    {
      asset_id: "d6afe2b799693f827bf55ac805756e43",
      public_id: "ri87pudm2jss5jtbmbw6",
      secure_url:
        "https://res.cloudinary.com/dfnmx7vgc/image/upload/v1723845336/dfkela1w4k0vzuqknqrc.jpg",
    },
  ];
  const [activeDrags, setActiveDrags] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [deltaPosition, setDeltaPosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [itemSize, setItemSize] = useState({ width: 0, height: 0 });
  const [mainContainer, setContainer] = useState({ width: 0, height: 0 });
  const [positionWidthimage, setPositionWidthimage] = useState([]);
  const [controlledPosition, setControlledPosition] = useState([]);
  const onStart = () => {
    if ((imageRef.current, itemref.current)) {
      setImageSize({
        height: imageRef.current.offsetHeight,
        width: imageRef.current.offsetWidth,
      });

      setItemSize({
        height: itemref.current.offsetHeight,
        width: itemref.current.offsetWidth,
      });

      console.log(itemref.current.offsetHeight, itemref.current.offsetWidth);
    }
    setActiveDrags(activeDrags + 1);
  };

  const onStop = (e, data) => {
    // console.log(data.lastX);
    // position of image from left
    // console.log(imageSize.width + data.lastX + 24);
    const currentIndex = defaultPosition.filter(
      (item, index) => index === imageIndex
    );
    defaultPosition[imageIndex] = {
      id: defaultPosition[imageIndex].id,
      imageIndex: defaultPosition[imageIndex].imageIndex,
      ui: {
        left: data.lastX,
        top: data.lastY,
      },
      position: {
        left: imageSize.width + data.lastX + 24,
        top: imageSize.height + data.lastY,
        bottom: 0,
        right: 0,
      },
    };
    console.log(positionWidthimage);
    setPositionWidthimage(defaultPosition);
  };

  const onDropAreaMouseEnter = (e) => {
    if (activeDrags) {
      e.target.classList.add("hovered");
    }
  };

  const onDropAreaMouseLeave = (e) => {
    e.target.classList.remove("hovered");
  };

  // For controlled component
  const adjustXPos = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setControlledPosition((prevPosition) => ({
      ...prevPosition,
      x: prevPosition.x - 10,
    }));
  };

  const adjustYPos = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setControlledPosition((prevPosition) => ({
      ...prevPosition,
      y: prevPosition.y - 10,
    }));
  };

  const onControlledDrag = (e, position) => {
    const { x, y } = position;
    setControlledPosition({ x, y });
  };

  const onControlledDragStop = (e, position) => {
    onControlledDrag(e, position);
    onStop();
  };

  const dragHandlers = { onStart, onStop };

  useEffect(() => {
    // console.log(selectedStyles);
    // console.log(
    //   selectedStyles.map((item, index) => {
    //     return {
    //       item,
    //       imageIndex: index,
    //       left: 0,
    //       right: 0,
    //       top: 0,
    //       Bottom: 0,
    //     };
    //   })
    // );
  }, [imageIndex]);
  return (
    <div className="bg-white m-auto overflow-hidden lg:mt-[4rem] p-6 rounded-[10px] lg:w-[450px] relative">
      <button
        onClick={() => {
          closeModal();
        }}
      >
        <Image src={closeIcon} alt="" className="absolute top-4 right-4" />
      </button>
      <div className="mb-4">
        <Typography
          textColor="text-dark"
          textWeight="font-[600]"
          textSize="text-[14px]"
        >
          Drag & Drop parts of the cloth
        </Typography>
      </div>
      <div className="flex gap-4 ">
        <div className="w-[70%] relative">
          <div className="absolute top-[50%] left-0 flex items-center justify-between w-[100%] px-6">
            <div>
              {imageIndex > 0 && (
                <button
                  className="bg-white w-[2rem] h-[2rem] flex items-center justify-center rounded-[50%] cursor-pointer"
                  onClick={() => {
                    setImageIndex(imageIndex - 1);
                  }}
                >
                  <Image
                    height={18}
                    width={18}
                    src={arrowLeft}
                    alt="product image"
                    className="rounded-b-[12px]"
                    unoptimized
                  />
                </button>
              )}
            </div>
            <div>
              {imageIndex < data.length - 1 && (
                <button
                  className="bg-white w-[2rem] h-[2rem] flex items-center justify-center rounded-[50%] cursor-pointer"
                  onClick={() => {
                    setImageIndex(imageIndex + 1);
                  }}
                >
                  <Image
                    height={18}
                    width={18}
                    src={arrowRight}
                    alt="product image"
                    className="rounded-b-[12px]"
                    unoptimized
                  />
                </button>
              )}
            </div>
          </div>
          {productImages.length > 0 && (
            <Image
              ref={imageRef}
              alt=""
              src={productImages[imageIndex].secure_url}
              width={50}
              height={50}
              style={{
                width: "100%",
                height: "auto",
                maxWidth: "300px",
              }}
              unoptimized
            />
          )}
        </div>
        {defaultPosition.map(
          (item, index) =>
            index == imageIndex && (
              <div
                className="w-[30%] bg-[#EBEBEBEB] py-2 px-3 rounded-[10px]"
                ref={subRef}
              >
                {selectedStyles.filter((item) => item.name === "tops").length >
                  0 && (
                  <Draggable {...dragHandlers}>
                    <div
                      className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4 "
                      ref={itemref}
                    >
                      <Typography
                        textColor="text-white"
                        textWeight="font-[500]"
                        textSize="text-[12px]"
                      >
                        Top
                      </Typography>
                      <div className="w-[10px] h-[10px] bg-white absolute top-1 left-2 rounded-[50%]"></div>
                    </div>
                  </Draggable>
                )}
                {selectedStyles.filter((item) => item.name === "bottoms")
                  .length > 0 && (
                  <Draggable {...dragHandlers}>
                    <div className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4">
                      <Typography
                        textColor="text-white"
                        textWeight="font-[500]"
                        textSize="text-[12px]"
                      >
                        Bottom
                      </Typography>
                      <div className="w-[10px] h-[10px] bg-white absolute top-1 left-2 rounded-[50%]"></div>
                    </div>
                  </Draggable>
                )}
                {selectedStyles.filter((item) => item.name === "skirts")
                  .length > 0 && (
                  <Draggable {...dragHandlers}>
                    <div className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4">
                      <Typography
                        textColor="text-white"
                        textWeight="font-[500]"
                        textSize="text-[12px]"
                      >
                        Shirt
                      </Typography>
                      <div className="w-[10px] h-[10px] bg-white absolute top-1 left-2 rounded-[50%]"></div>
                    </div>
                  </Draggable>
                )}
                {selectedStyles.filter((item) => item.name === "dresses")
                  .length > 0 && (
                  <Draggable {...dragHandlers}>
                    <div className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4">
                      <Typography
                        textColor="text-white"
                        textWeight="font-[500]"
                        textSize="text-[12px]"
                      >
                        Dress
                      </Typography>
                      <div className="w-[10px] h-[10px] bg-white absolute top-1 left-2 rounded-[50%]"></div>
                    </div>
                  </Draggable>
                )}
                {selectedStyles.filter((item) => item.name === "outfits")
                  .length > 0 && (
                  <Draggable {...dragHandlers}>
                    <div className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4">
                      <Typography
                        textColor="text-white"
                        textWeight="font-[500]"
                        textSize="text-[12px]"
                      >
                        Outfit
                      </Typography>
                      <div className="w-[10px] h-[10px] bg-white absolute top-1 left-2 rounded-[50%]"></div>
                    </div>
                  </Draggable>
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default DragDrop;
