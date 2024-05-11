import { BallTriangle } from "react-loader-spinner";
const Loader = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <BallTriangle
        height={100}
        width={100}
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
