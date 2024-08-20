import StyleComp from ".";

const Styles = ({ data }) => {
  return (
    <div className="flex items-center gap-2">
      {data &&
        data.map((item, index) => <StyleComp image={item.image} key={index} />)}
    </div>
  );
};

export default Styles;
