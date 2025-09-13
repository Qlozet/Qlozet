
const DashedLine = ({ text, position }) => {
    return (
        <div className={`border-t-[1.5px] border-dashed border-gray-500 w-full relative ${position === "center" ? "flex items-center justify-center" : ""}`}>
            <span className={` bg-gray-400 absolute ${position === "center" ? "translate-y-[-2px] px-4 " : "translate-y-[-13px] pr-4 "}`}>{text}</span>
        </div>
    );
};

export default DashedLine