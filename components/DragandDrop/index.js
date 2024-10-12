import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import Typography from "../Typography";
import arrowLeft from "../../public/assets/svg/arrrowLeft.svg";
import arrowRight from "../../public/assets/svg/arrowRightt.svg";
import closeIcon from "../../public/assets/svg/material-symbols_close-rounded.svg";

const DragDrop = ({
  closeModal,
  productImages,
  selectedStyles,
  handleSelectStyle,
}) => {
  // const defaultPosition = selectedStyles.map((item, index) => {
  //   return {
  //     id: item.id,
  //     imageIndex: index,
  //     position: { left: 0, right: 0, top: 0, bottom: 0 },
  //     uiLeft: 0,
  //     uiTop: 0,
  //   };
  // });

  const imageConRef = useRef();
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
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [itemSize, setItemSize] = useState({ width: 0, height: 0 });
  const [customStyles, setCustomStyles] = useState([]);
  const [customeStylesOrAllImage, setCustomeStyleOfAllImage] = useState([]);
  const [currentStyle, setCurrentStyle] = useState({
    name: "",
    imageIndex: "",
  });
  const [customeStylesUiPosition, setCustomStylesUiPosition] = useState([
    { left: 29, top: 20, style: "tops", index: 0 },
    { left: 40, top: 60, style: "tops", index: 1 },
  ]);
  const [positionWidthimage, setPositionWidthimage] = useState([]);
  const [controlledPosition, setControlledPosition] = useState([]);
  const onStart = () => {
    if ((imageConRef.current, itemref.current)) {
      setImageSize({
        height: imageConRef.current.offsetHeight,
        width: imageConRef.current.offsetWidth,
      });

      setItemSize({
        height: itemref.current.offsetHeight,
        width: itemref.current.offsetWidth,
      });
    }
    setActiveDrags(activeDrags + 1);
  };

  const onStop = (e, data) => {
    const position = {
      left: (imageSize.width + data.lastX + 24 / imageSize.width) * 100,
      top: (imageSize.height + data.lastY + 24 / imageSize.height) * 100,
      right: 0,
      bottom: 0,
    };

    const newSTyles = customStyles.map((item) => {
      if (item.name === currentStyle.name) {
        return { ...item, imageIndex: imageIndex, position: position };
      } else {
        return { ...item };
      }
    });

    const newCustomStyleofAllImage = customeStylesOrAllImage.map((item) => {
      if (item.imageIndex === imageIndex) {
        return { ...item, style: newSTyles };
      } else {
        return { ...item };
      }
    });
    setCustomStyles(newSTyles);
    setCustomeStyleOfAllImage(newCustomStyleofAllImage);
    // setCustomStyles((prevdata) => {
    //   return [...prevdata, customStyle];
    // });
    handleSelectStyle(newCustomStyleofAllImage);
  };

  function handleLastTouch(x, y) {
  }

  const handleTuchMove = (event) => {
    const touches = event.changedTouches;
    if (touches.length > 0) {
      const lastTouch = touches[touches.length - 1];
      handleLastTouch(lastTouch.clientX, lastTouch.clientY);
    }
  };

  const onMouseMove = (event) => {
    event.prevDefault();
   
  };

  const handleSetCurentStyle = (style, imgIndex) => {
    setCurrentStyle({ name: style, imageIndex: imgIndex });
  };
  const dragHandlers = { onStart };

  useEffect(() => {
  
  }, [imageIndex]);

  useEffect(() => {
   
    customeStylesUiPosition.filter(
      (item) => item.style === "tops" && item.index === imageIndex
    )[0];
    const indexCheck = [];
    data.map((item, index) => {
      const newItem = {
        imageIndex: index,
      };
      indexCheck.push(newItem);
    });
    setCustomeStyleOfAllImage(indexCheck);
    selectedStyles.map((item, index) => {
      const newItem = {
        id: item.id,
        name: item.name,
      };

      setCustomStyles((prevData) => {
        return [...prevData, newItem];
      });
    });
  }, [selectedStyles]);
  return (
    <div className="bg-white m-auto overflow-hidden lg:mt-[4rem] p-6 rounded-[10px] lg:w-[450px]">
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
      <div className="flex gap-4 relative">
        <div className="w-[70%] " ref={imageConRef}>
          <div className="relative w-full">
            <div className="absolute mt-[50%] left-0 flex items-center justify-between w-[100%] px-6 ">
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
                {imageIndex < productImages.length - 1 && (
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
          </div>

          {productImages.length > 0 && (
            <Image
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
              onMouseMove={onMouseMove}
              onMouseUp={onStop}
              touchEnd={handleTuchMove}
            />
          )}
        </div>
        {productImages.map(
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
                      onKeyDown={() => {
                        handleSetCurentStyle("tops", imageIndex);
                      }}
                      onTouchStart={() => {
                        handleSetCurentStyle("tops", imageIndex);
                      }}
                      style={{
                        position: "absolute",
                        left: `${
                          customeStylesUiPosition.filter(
                            (item) =>
                              item.style === "tops" && item.index === imageIndex
                          ).length > 0 &&
                          customeStylesUiPosition.filter(
                            (item) =>
                              item.style === "tops" && item.index === imageIndex
                          )[0].left
                        }px`,
                        top: `${
                          customeStylesUiPosition.filter(
                            (item) =>
                              item.style === "tops" && item.index === imageIndex
                          ).length > 0 &&
                          customeStylesUiPosition.filter(
                            (item) =>
                              item.style === "tops" && item.index === imageIndex
                          )[0].top
                        }px`,
                      }}
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
                    <div
                      className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4"
                      onKeyDown={() => {
                        handleSetCurentStyle("bottoms", imageIndex);
                      }}
                      onTouchStart={() => {
                        handleSetCurentStyle("bottoms", imageIndex);
                      }}
                    >
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
                    <div
                      className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4"
                      onKeyDown={() => {
                        handleSetCurentStyle("skirts", imageIndex);
                      }}
                      onTouchStart={() => {
                        handleSetCurentStyle("skirts", imageIndex);
                      }}
                    >
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
                    <div
                      className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4"
                      onKeyDown={() => {
                        handleSetCurentStyle("dresses", imageIndex);
                      }}
                      onTouchStart={() => {
                        handleSetCurentStyle("dresses", imageIndex);
                      }}
                    >
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
                    <div
                      className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4"
                      onKeyDown={() => {
                        handleSetCurentStyle("outfits", imageIndex);
                      }}
                      onTouchStart={() => {
                        handleSetCurentStyle("outfits", imageIndex);
                      }}
                    >
                      <Typography
                        textColor="text-white"
                        textWeight="font-[500]"
                        textSize="text-[12px]"
                      >
                        Outfit
                      </Typography>
                      {/* <div className="w-[10px] h-[10px] bg-white absolute top-1 left-2 rounded-[50%]"></div> */}
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
