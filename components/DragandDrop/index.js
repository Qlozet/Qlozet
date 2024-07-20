import Image from "next/image";
import React from "react";
import Draggable from "react-draggable";
import Typography from "../Typography";
import arrowLeft from "../../public/assets/svg/arrrowLeft.svg";
import arrowRight from "../../public/assets/svg/arrowRightt.svg";

class DragDrop extends React.Component {
  state = {
    activeDrags: 0,
    deltaPosition: {
      x: 0,
      y: 0,
    },
    controlledPosition: {
      x: -400,
      y: 200,
    },
  };

  handleDrag = (e, ui) => {
    const { x, y } = this.state.deltaPosition;
    this.setState({
      deltaPosition: {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      },
    });
  };

  onStart = () => {
    this.setState({ activeDrags: ++this.state.activeDrags });
  };

  onStop = () => {
    this.setState({ activeDrags: --this.state.activeDrags });
  };
  onDrop = (e) => {
    this.setState({ activeDrags: --this.state.activeDrags });
    if (e.target.classList.contains("drop-target")) {
      alert("Dropped!");
      e.target.classList.remove("hovered");
    }
  };
  onDropAreaMouseEnter = (e) => {
    if (this.state.activeDrags) {
      e.target.classList.add("hovered");
    }
  };
  onDropAreaMouseLeave = (e) => {
    e.target.classList.remove("hovered");
  };

  // For controlled component
  adjustXPos = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = this.state.controlledPosition;
    this.setState({ controlledPosition: { x: x - 10, y } });
  };

  adjustYPos = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { controlledPosition } = this.state;
    const { x, y } = controlledPosition;
    this.setState({ controlledPosition: { x, y: y - 10 } });
  };

  onControlledDrag = (e, position) => {
    const { x, y } = position;
    this.setState({ controlledPosition: { x, y } });
  };

  onControlledDragStop = (e, position) => {
    this.onControlledDrag(e, position);
    this.onStop();
  };

  render() {
    const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
    const { deltaPosition, controlledPosition } = this.state;
    return (
      <div className=" bg-white m-auto overflow-hidden lg:mt-[4rem] p-6 rounded-[10px] lg:w-[450px]">
        <div className="mb-4">
          <Typography
            textColor="text-dark"
            textWeight="font-[600]"
            textSize="text-[14px]"
          >
            Drag & Drop parts of th cloth
          </Typography>
        </div>
        <div className="flex gap-4">
          <div className="w-[70%] relative">
            <div className="absolute top-[50%] left-0 flex items-center justify-between w-[100%] px-6">
              <div className="bg-white w-[2rem]  h-[2rem] flex items-center justify-center rounded-[50%] cursor-pointer">
                <Image
                  height={18}
                  width={18}
                  src={arrowLeft}
                  alt="product image"
                  className="rounded-b-[12px]"
                  unoptimized
                />
              </div>
              <div className="bg-white w-[2rem]  h-[2rem] flex items-center justify-center rounded-[50%] cursor-pointer">
                <Image
                  height={18}
                  width={18}
                  src={arrowRight}
                  alt="product image"
                  className="rounded-b-[12px]"
                  unoptimized
                />
              </div>
            </div>
            <Image
              alt=""
              src="https://res.cloudinary.com/dfnmx7vgc/image/upload/v1718639267/qqhdqwljcxw5v8euyvja.webp"
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
          <div className="w-[30%] bg-[#EBEBEBEB] py-4 px-3 rounded-[10px]">
            <div>
              <Draggable {...dragHandlers}>
                <div className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4">
                  <Typography
                    textColor="text-white"
                    textWeight="font-[500]"
                    textSize="text-[12px]"
                  >
                    Neckline
                  </Typography>
                  <div className="w-[10px] h-[10px] bg-white absolute top-1 left-2 rounded-[50%]"></div>
                </div>
              </Draggable>
            </div>

            <div>
              <Draggable {...dragHandlers}>
                <div className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4">
                  <Typography
                    textColor="text-white"
                    textWeight="font-[500]"
                    textSize="text-[12px]"
                  >
                    Core
                  </Typography>
                  <div className="w-[10px] h-[10px] bg-white absolute top-1 left-2 rounded-[50%]"></div>
                </div>
              </Draggable>
            </div>
            <Draggable {...dragHandlers}>
              <div className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4">
                <Typography
                  textColor="text-white"
                  textWeight="font-[500]"
                  textSize="text-[12px]"
                >
                  Sleeve
                </Typography>
                <div className="w-[10px] h-[10px] bg-white absolute top-1 left-2 rounded-[50%]"></div>
              </div>
            </Draggable>
            <Draggable {...dragHandlers}>
              <div className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4">
                <Typography
                  textColor="text-white"
                  textWeight="font-[500]"
                  textSize="text-[12px]"
                >
                  Skirt
                </Typography>
                <div className="w-[10px] h-[10px] bg-white absolute top-1 left-2 rounded-[50%]"></div>
              </div>
            </Draggable>
            <Draggable {...dragHandlers}>
              <div className="relative bg-[#0D0C0CBD] rounded-[6px] px-6 py-2 cursor-move my-4">
                <Typography
                  textColor="text-white"
                  textWeight="font-[500]"
                  textSize="text-[12px]"
                >
                  Trouser
                </Typography>
                <div className="w-[10px] h-[10px] bg-white absolute top-1 left-2 rounded-[50%]"></div>
              </div>
            </Draggable>
          </div>
        </div>
      </div>
    );
  }
}

export default DragDrop;
