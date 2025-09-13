import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import Typography from "../Typography";
import arrowLeft from "@/public/assets/svg/arrrowLeft.svg";
import arrowRight from "@/public/assets/svg/arrowRightt.svg";
import closeIcon from "@/public/assets/svg/material-symbols_close-rounded.svg";
import styles from "./index.module.css";
import StypePositioning from "./style";
const DragDrop = ({
  closeModal,
  productImages,
  selectedStyles,
  handleSelectStyle,
}) => {
  const imageRef = useRef();
  const subRef = useRef();
  const [imageIndex, setImageIndex] = useState(0);
  const [customStyles, setCustomStyles] = useState([]);
  const [startCal, setStartCal] = useState(false);
  const [customeStylesOrAllImage, setCustomeStyleOfAllImage] = useState([]);
  const [touchPoint, setTouchPoint] = useState({ x: 0, y: 0 });
  const [currentStyle, setCurrentStyle] = useState();
  const [customeStylesUiPosition, setCustomStylesUiPosition] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleSetCurentStyle = (style, imgIndex) => {
    setStartCal(true);
    setCurrentStyle({ class: style, imageIndex: imgIndex });
  };

  const calcultePosition = () => {
    if (
      startCal &&
      currentStyle &&
      customeStylesUiPosition[customeStylesUiPosition.length - 1]
    ) {
      const { width, height } = imageRef.current.getBoundingClientRect();
      if (
        customeStylesUiPosition[customeStylesUiPosition.length - 1].left <
        width - 40
      ) {
        const position = {
          left:
            (customeStylesUiPosition[customeStylesUiPosition.length - 1].left *
              100) /
            width,
          top:
            (customeStylesUiPosition[customeStylesUiPosition.length - 1].top *
              100) /
            height,
          right: 0,
          bottom: 0,
        };
        const newSTyles = customStyles.map((item) => {
          if (item.class === currentStyle.class) {
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
      } else {
        let lastStyles =
          customeStylesUiPosition[customeStylesUiPosition.length - 1];
        const newCustomeStylesUiPositionay = customeStylesUiPosition.filter(
          (item) => {
            if (
              item.imageIndex === lastStyles.imageIndex &&
              item.style === lastStyles.style
            ) {
            } else {
              return item;
            }
          }
        );
        setCustomStylesUiPosition(newCustomeStylesUiPositionay);
      }
    }
    setStartCal(false);
  };

  const touchMove = (e) => {
    if (startCal && currentStyle) {
      const { width, height, left, y } =
        imageRef.current.getBoundingClientRect();
      for (let i = 0; i < e.changedTouches.length; i++) {
        setTouchPoint({
          ...touchPoint,
          x: e.changedTouches[i].clientX - left,
          y: e.changedTouches[i].clientY - y,
        });
      }

      setCustomStylesUiPosition((prevData) => {
        return [
          ...prevData,
          {
            left: touchPoint.x,
            top: touchPoint.y,
            style: currentStyle.class,
            imageIndex: imageIndex,
          },
        ];
      });
    }
  };

  const mouseMove = (e) => {
    e.preventDefault();
    if (startCal && currentStyle) {
      const { left, y, width, height } =
        imageRef.current.getBoundingClientRect();
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
              style: currentStyle.class,
              imageIndex: imageIndex,
            },
          ];
        });
      }
    }
  };

  useEffect(() => {
    const styleWithPosition = selectedStyles.filter((item) => item.position);
    const { width, height } = imageRef.current.getBoundingClientRect();
    setCustomStylesUiPosition(
      styleWithPosition.map((item) => {
        return {
          left: (item.position.left * width) / 100,
          right: item.position.right,
          top: (item.position.top * height) / 100,
          bottom: item.position.bottom,
          imageIndex: item.imageIndex,
          style: item.class,
          price: item.price
        };
      })
    );
  }, [imageIndex]);

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
        class: item.class,
        price: item.price
      };

      setCustomStyles((prevData) => {
        return [...prevData, newItem];
      });
    });
  }, [selectedStyles]);
  return (
    <div

      onMouseUp={() => {
        calcultePosition();
      }}
      onTouchEnd={() => {
        calcultePosition();
      }}
    >
      <div className={`bg-white m-auto min-w-[97%] lg:mt-[4rem] p-6 rounded-[10px] relative md:min-w-[450px] max-w-[450px] ${styles.sizecontainer}`}>
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
            textSize="text-sm"
          >
            Drag & Drop parts of the cloth
          </Typography>
        </div>
        <div
          className={`flex flex-col lg:flex-row gap-4 relative overflow-hidden `}
          onMouseDown={(e) => {
            setStartCal(true);
          }}
          onMouseMove={mouseMove}
          onTouchMove={touchMove}
        >
          <div className="lg:w-[70%] w-full">
            {productImages.length > 0 && (
              <div className={`relative`}>
                <div className="absolute top-[50%] left-0 flex items-center justify-between w-[100%] px-6">
                  <div className="min-w-[70%] relative top-0 left-0 z-40">
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
                <Image
                  ref={imageRef}
                  alt=""
                  src={productImages[imageIndex].secure_url}
                  width={50}
                  height={50}
                  style={{
                    width: "100%",
                    height: "auto",

                  }}
                  unoptimized
                  onLoad={() => setIsLoaded(true)}
                />

              </div>
            )}
          </div>
          <div className="flex flex-col gap-4  bg-[#EBEBEBEB] py-4 lg:w-[30%] w-full">
            {productImages.map(
              (item, index) =>
                index == imageIndex && (
                  <div className="px-3 rounded-[10px] " ref={subRef}>
                    <StypePositioning
                      imageIndex={imageIndex}
                      handleSetCurentStyle={handleSetCurentStyle}
                      stylesType="tops"
                      customeStylesUiPosition={customeStylesUiPosition}
                      selectedStyles={selectedStyles}
                    ></StypePositioning>
                    <StypePositioning
                      imageIndex={imageIndex}
                      handleSetCurentStyle={handleSetCurentStyle}
                      stylesType="bottoms"
                      customeStylesUiPosition={customeStylesUiPosition}
                      selectedStyles={selectedStyles}
                    ></StypePositioning>
                    <StypePositioning
                      imageIndex={imageIndex}
                      handleSetCurentStyle={handleSetCurentStyle}
                      stylesType="skirts"
                      customeStylesUiPosition={customeStylesUiPosition}
                      selectedStyles={selectedStyles}
                    ></StypePositioning>
                    <StypePositioning
                      imageIndex={imageIndex}
                      handleSetCurentStyle={handleSetCurentStyle}
                      stylesType="dresses"
                      customeStylesUiPosition={customeStylesUiPosition}
                      selectedStyles={selectedStyles}
                    ></StypePositioning>
                    <StypePositioning
                      imageIndex={imageIndex}
                      handleSetCurentStyle={handleSetCurentStyle}
                      stylesType="outfits"
                      customeStylesUiPosition={customeStylesUiPosition}
                      selectedStyles={selectedStyles}
                    ></StypePositioning>
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
