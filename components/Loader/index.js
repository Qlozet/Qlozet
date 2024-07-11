import { BallTriangle } from "react-loader-spinner";
const Loader = ({ small, height, width }) => {
  return (
    <div
      className={`${
        small ? "bg-[#DDE2E5]" : "h-screen w-screen bg-[#F8F9FA]"
      }  flex items-center justify-center max-w-[1324px] m-auto`}
    >
      <BallTriangle
        height={height ? height : 100}
        width={width ? width : 100}
        radius={5}
        color="rgba(62, 28, 1, 1)"
        ariaLabel="ball-triangle-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>
  );
};

export default Loader;
