import Image from "next/image";

const Variant = ({ bg }) => {
  return (
    <div>
      {bg.includes("https://res.cloudinary.com") ? (
        <div
          className="relative my-2 w-[3.5rem] h-[2rem] rounded-[2px]"
          style={{
            backgroundImage: `url('${bg}')`,
            backgroundPosition: "center",
          }}
        ></div>
      ) : (
        <div
            className={`w-[3.5rem] h-[2rem] rounded-[2px]`}
          style={{
            backgroundColor: bg,
          }}
        ></div>
      )}
    </div>
  );
};

export default Variant;
