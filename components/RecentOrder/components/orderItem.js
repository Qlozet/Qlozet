import "./index.module.css";

const OrderItem = ({ order }) => {
  return (
    <div className="order-item p-5 mb-2 flex justify-between bg-gray-400 rounded-md items-end">
      <div className="flex space-x-2 w-2/3 justify-between ">
        <div className="flex gap-5 flex-col">
          <span>{order.product}</span>
          <span>{order.name}</span>
        </div>

        <div className="flex   gap-5 flex-col">
          <span>N{order.price}</span>
          <span>{order.date}</span>
        </div>
      </div>

      <div>
        <button className="rounded-lg bg-gray-300 p-1 px-3  ">More</button>
      </div>
    </div>
  );
};

export default OrderItem;
