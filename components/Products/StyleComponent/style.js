import StyleComp from ".";
const Styles = ({ data, price }) => {
  return (
    <div className="flex items-center gap-2">
      {data &&
        data.map((item, index) => (
          <StyleComp price={price} image={item.image} key={index} />
        ))}
    </div>
  );
};

export default Styles;
