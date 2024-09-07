import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import Typography from "../Typography";
import arrowLeft from "../../public/assets/svg/arrrowLeft.svg";
import arrowRight from "../../public/assets/svg/arrowRightt.svg";
import closeIcon from "../../public/assets/svg/material-symbols_close-rounded.svg";
import style from "./index.module.css";
const DragDrop = ({
  closeModal,
  productImages,
  selectedStyles,
  handleSelectStyle,
}) => {
  const imageRef = useRef();
  const draggedRef = useRef();
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
  const [imageIndex, setImageIndex] = useState(0);
  const [customStyles, setCustomStyles] = useState([]);
  const [startCal, setStartCal] = useState(false);
  const [customeStylesOrAllImage, setCustomeStyleOfAllImage] = useState([]);
  const [touchPoint, setTouchPoint] = useState({ x: 0, y: 0 });
  const [currentStyle, setCurrentStyle] = useState();
  const [customeStylesUiPosition, setCustomStylesUiPosition] = useState([]);
  const handleSetCurentStyle = (style, imgIndex) => {
    setCurrentStyle({ name: style, imageIndex: imgIndex });
  };

  const calcultePosition = () => {
    if (startCal && currentStyle) {
      const { width, height } = imageRef.current.getBoundingClientRect();
      const position = {
        left: customeStylesUiPosition[customeStylesUiPosition.length - 1].left,
        top: customeStylesUiPosition[customeStylesUiPosition.length - 1].top,
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
      handleSelectStyle(newCustomStyleofAllImage, width, height);
      setStartCal(false);
    }
  };

  const touchMove = (e) => {
    if (startCal && currentStyle) {
      const { width, height, left, y } =
        imageRef.current.getBoundingClientRect();
      for (let i = 0; i < e.changedTouches.length; i++) {
        setTouchPoint({
          ...touchPoint,
          x: e.changedTouches[i].pageX - left + 10 - 32,
          y: e.changedTouches[i].pageY - y + 40,
        });
      }
      setCustomStylesUiPosition((prevData) => {
        return [
          ...prevData,
          {
            left: touchPoint.x,
            top: touchPoint.y,
            style: currentStyle.name,
            imageIndex: imageIndex,
          },
        ];
      });
    }
  };

  const mouseMove = (e) => {
    if (startCal && currentStyle) {
      const { left, y } = imageRef.current.getBoundingClientRect();
      setTouchPoint({
        ...touchPoint,
        x: e.clientX - left,
        y: e.clientY - y,
      });

      if (startCal) {
        setCustomStylesUiPosition((prevData) => {
          return [
            ...prevData,
            {
              left: e.clientX - left,
              top: e.clientY - y,
              style: currentStyle.name,
              imageIndex: imageIndex,
            },
          ];
        });
      }
    }
  };

  useEffect(() => {
    console.log(selectedStyles);

    const styleWithPosition = selectedStyles.filter((item) => item.position);
    setCustomStylesUiPosition(
      styleWithPosition.map((item) => {
        return {
          left: item.position.left,
          right: item.position.right,
          top: item.position.top,
          bottom: item.position.bottom,
          imageIndex: item.imageIndex,
          style: item.name,
        };
      })
    );
  }, []);

  useEffect(() => {
    const indexCheck = [];
    productImages.map((item, index) => {
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
    <div
      className={`${style.modal} fixed top-0 left-0 w-full bg-[#00000080] h-screen overflow-y-scroll px-4 lg:px-0  flex items-center justify-center`}
      style={{
        zIndex: 300,
      }}
      onMouseUp={() => {
        calcultePosition();
      }}
    >
      <div className="bg-white m-auto  lg:mt-[4rem] p-6 rounded-[10px] relative max-w-[450px]">
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
        <div
          className={`flex gap-4 relative overflow-hidden ${style.sizecontainer}`}
          onMouseDown={(e) => {
            e.preventDefault();
            setStartCal(true);
          }}
          onMouseMove={mouseMove}
          onTouchMove={touchMove}
        >
          <div className="w-[70%] ">
            {productImages.length > 0 && (
              <div className={`relative`}>
                <div className="absolute top-[50%] left-0 flex items-center justify-between w-[100%] px-6">
                  <div className="w-[70%] relative top-0 left-0 z-40">
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
                  <div className="relative">
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
                {/* This is to remove the blue background due to drag */}
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
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4  bg-[#EBEBEBEB] py-4 w-[30%]">
            {productImages.map(
              (item, index) =>
                index == imageIndex && (
                  <div className="px-3 rounded-[10px] " ref={subRef}>
                    {selectedStyles.filter((item) => item.name === "tops")
                      .length > 0 && (
                      <div
                        key={index}
                        onTouchStart={() => {
                          handleSetCurentStyle("tops", imageIndex);
                        }}
                        onMouseDown={() => {
                          setStartCal(true);
                          handleSetCurentStyle("tops", imageIndex);
                        }}
                        className="bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move w-[5rem] mb-4"
                        ref={draggedRef}
                        style={{
                          position: customeStylesUiPosition.filter(
                            (item) =>
                              item.imageIndex === imageIndex &&
                              item.style === "tops"
                          ).length
                            ? "absolute"
                            : "relative",
                          left:
                            customeStylesUiPosition.filter(
                              (item) =>
                                item.imageIndex === imageIndex &&
                                item.style === "tops"
                            ).length > 0 &&
                            `${
                              customeStylesUiPosition.filter(
                                (item) =>
                                  item.imageIndex === imageIndex &&
                                  item.style === "tops"
                              )[
                                customeStylesUiPosition.filter(
                                  (item) =>
                                    item.imageIndex === imageIndex &&
                                    item.style === "tops"
                                ).length - 1
                              ].left
                            }px`,
                          top:
                            customeStylesUiPosition.filter(
                              (item) =>
                                item.imageIndex === imageIndex &&
                                item.style === "tops"
                            ).length > 0 &&
                            `${
                              customeStylesUiPosition.filter(
                                (item) =>
                                  item.imageIndex === imageIndex &&
                                  item.style === "tops"
                              )[
                                customeStylesUiPosition.filter(
                                  (item) =>
                                    item.imageIndex === imageIndex &&
                                    item.style === "tops"
                                ).length - 1
                              ].top
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
                      // </Draggable>
                    )}
                    {selectedStyles.filter((item) => item.name === "bottoms")
                      .length > 0 && (
                      // <Draggable
                      //   onStart={() => {
                      //     handleSetCurentStyle("bottoms", imageIndex);
                      //   }}
                      // >
                      <div
                        onTouchStart={() => {
                          handleSetCurentStyle("bottoms", imageIndex);
                        }}
                        onMouseDown={() => {
                          setStartCal(true);
                          handleSetCurentStyle("bottoms", imageIndex);
                        }}
                        className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move w-[5rem] mb-4"
                        style={{
                          position: customeStylesUiPosition.filter(
                            (item) =>
                              item.imageIndex === imageIndex &&
                              item.style === "bottoms"
                          ).length
                            ? "absolute"
                            : "relative",
                          left:
                            customeStylesUiPosition.filter(
                              (item) =>
                                item.imageIndex === imageIndex &&
                                item.style === "bottoms"
                            ).length > 0 &&
                            `${
                              customeStylesUiPosition.filter(
                                (item) =>
                                  item.imageIndex === imageIndex &&
                                  item.style === "bottoms"
                              )[
                                customeStylesUiPosition.filter(
                                  (item) =>
                                    item.imageIndex === imageIndex &&
                                    item.style === "bottoms"
                                ).length - 1
                              ].left
                            }px`,
                          top:
                            customeStylesUiPosition.filter(
                              (item) =>
                                item.imageIndex === imageIndex &&
                                item.style === "bottoms"
                            ).length > 0 &&
                            `${
                              customeStylesUiPosition.filter(
                                (item) =>
                                  item.imageIndex === imageIndex &&
                                  item.style === "bottoms"
                              )[
                                customeStylesUiPosition.filter(
                                  (item) =>
                                    item.imageIndex === imageIndex &&
                                    item.style === "bottoms"
                                ).length - 1
                              ].top
                            }px`,
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
                      // </Draggable>
                    )}
                    {selectedStyles.filter((item) => item.name === "skirts")
                      .length > 0 && (
                      <div
                        onTouchStart={() => {
                          handleSetCurentStyle("skirts", imageIndex);
                        }}
                        onMouseDown={() => {
                          setStartCal(true);
                          handleSetCurentStyle("skirts", imageIndex);
                        }}
                        className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move w-[5rem] mb-4"
                        style={{
                          position: customeStylesUiPosition.filter(
                            (item) =>
                              item.imageIndex === imageIndex &&
                              item.style === "skirts"
                          ).length
                            ? "absolute"
                            : "relative",
                          left:
                            customeStylesUiPosition.filter(
                              (item) =>
                                item.imageIndex === imageIndex &&
                                item.style === "skirts"
                            ).length > 0 &&
                            `${
                              customeStylesUiPosition.filter(
                                (item) =>
                                  item.imageIndex === imageIndex &&
                                  item.style === "skirts"
                              )[
                                customeStylesUiPosition.filter(
                                  (item) =>
                                    item.imageIndex === imageIndex &&
                                    item.style === "skirts"
                                ).length - 1
                              ].left
                            }px`,
                          top:
                            customeStylesUiPosition.filter(
                              (item) =>
                                item.imageIndex === imageIndex &&
                                item.style === "skirts"
                            ).length > 0 &&
                            `${
                              customeStylesUiPosition.filter(
                                (item) =>
                                  item.imageIndex === imageIndex &&
                                  item.style === "skirts"
                              )[
                                customeStylesUiPosition.filter(
                                  (item) =>
                                    item.imageIndex === imageIndex &&
                                    item.style === "skirts"
                                ).length - 1
                              ].top
                            }px`,
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
                      // </Draggable>
                    )}
                    {selectedStyles.filter((item) => item.name === "dresses")
                      .length > 0 && (
                      <div
                        onTouchStart={() => {
                          handleSetCurentStyle("dresses", imageIndex);
                        }}
                        onMouseDown={() => {
                          setStartCal(true);
                          handleSetCurentStyle("dresses", imageIndex);
                        }}
                        className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move w-[5rem] mb-4"
                        style={{
                          position: customeStylesUiPosition.filter(
                            (item) =>
                              item.imageIndex === imageIndex &&
                              item.style === "dresses"
                          ).length
                            ? "absolute"
                            : "relative",
                          left:
                            customeStylesUiPosition.filter(
                              (item) =>
                                item.imageIndex === imageIndex &&
                                item.style === "dresses"
                            ).length > 0 &&
                            `${
                              customeStylesUiPosition.filter(
                                (item) =>
                                  item.imageIndex === imageIndex &&
                                  item.style === "dresses"
                              )[
                                customeStylesUiPosition.filter(
                                  (item) =>
                                    item.imageIndex === imageIndex &&
                                    item.style === "dresses"
                                ).length - 1
                              ].left
                            }px`,
                          top:
                            customeStylesUiPosition.filter(
                              (item) =>
                                item.imageIndex === imageIndex &&
                                item.style === "dresses"
                            ).length > 0 &&
                            `${
                              customeStylesUiPosition.filter(
                                (item) =>
                                  item.imageIndex === imageIndex &&
                                  item.style === "dresses"
                              )[
                                customeStylesUiPosition.filter(
                                  (item) =>
                                    item.imageIndex === imageIndex &&
                                    item.style === "dresses"
                                ).length - 1
                              ].top
                            }px`,
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
                      // </Draggable>
                    )}
                    {selectedStyles.filter((item) => item.name === "outfits")
                      .length > 0 && (
                      // <Draggable
                      //   {...dragHandlers}
                      //   onStart={() => {
                      //     handleSetCurentStyle("outfits", imageIndex);
                      //   }}
                      // >
                      <div
                        onTouchStart={() => {
                          handleSetCurentStyle("outfits", imageIndex);
                        }}
                        onMouseDown={() => {
                          setStartCal(true);
                          handleSetCurentStyle("outfits", imageIndex);
                        }}
                        className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move w-[5rem] mb-4"
                        style={{
                          position: customeStylesUiPosition.filter(
                            (item) =>
                              item.imageIndex === imageIndex &&
                              item.style === "outfits"
                          ).length
                            ? "absolute"
                            : "relative",
                          left:
                            customeStylesUiPosition.filter(
                              (item) =>
                                item.imageIndex === imageIndex &&
                                item.style === "outfits"
                            ).length > 0 &&
                            `${
                              customeStylesUiPosition.filter(
                                (item) =>
                                  item.imageIndex === imageIndex &&
                                  item.style === "outfits"
                              )[
                                customeStylesUiPosition.filter(
                                  (item) =>
                                    item.imageIndex === imageIndex &&
                                    item.style === "outfits"
                                ).length - 1
                              ].left
                            }px`,
                          top:
                            customeStylesUiPosition.filter(
                              (item) =>
                                item.imageIndex === imageIndex &&
                                item.style === "outfits"
                            ).length > 0 &&
                            `${
                              customeStylesUiPosition.filter(
                                (item) =>
                                  item.imageIndex === imageIndex &&
                                  item.style === "outfits"
                              )[
                                customeStylesUiPosition.filter(
                                  (item) =>
                                    item.imageIndex === imageIndex &&
                                    item.style === "outfits"
                                ).length - 1
                              ].top
                            }px`,
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
                      // </Draggable>
                    )}
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragDrop;
