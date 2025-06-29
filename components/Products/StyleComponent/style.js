import StyleComp from ".";
const Styles = ({ data, handleEditStylePrice }) => {
  console.log(data)
  return (
    <div className="flex items-center gap-2">
      {data &&
        data.map((item, index) => {
          return (
            <StyleComp id={item.id} price={item.price} image={item.
              imageUrl
            } key={index} handleEditStylePrice={handleEditStylePrice} />
          )
        })}
    </div>
  );
};

export default Styles;
