const Variant = ({ bg }) => {
  return (
    <div
      className={`w-[4rem] h-[2rem] rounded-[8px]`}
      style={{
        backgroundColor: bg,
      }}
    ></div>
  );
};

export default Variant;
