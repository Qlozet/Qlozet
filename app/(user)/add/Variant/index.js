import Image from "next/image";

const Variant = ({ bg }) => {
  console.log(bg);
  return (
    <div>
      {bg.includes("https://res.cloudinary.com") ? (
        // <Image
        //   height={500}
        //   width={500}
        //   src={bg}
        //   alt="product image"
        //   className={`w-[3rem] h-[2rem] rounded-[8px]`}
        //   style={{
        //     width: "3rem",
        //     height: "2rem",
        //   }}
        // />
        <div
          className="relative my-2 w-[3.5rem] h-[2rem] rounded-[2px]"
          style={{
            backgroundImage: `url('${bg}')`,
            backgroundPosition: "center",
          }}
        ></div>
      ) : (
        <div
          className={`w-[3rem] h-[2rem] rounded-[8px]`}
          style={{
            backgroundColor: bg,
          }}
        ></div>
      )}
    </div>
  );
};

export default Variant;
