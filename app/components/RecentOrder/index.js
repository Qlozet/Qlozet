import OrderItem from "./components/orderItem";

const RecentOrder = ({ orders }) => {
  return (
    <div className="p-5">
      <div className="flex justify-between mb-5 ">
        <h2 className=" text-lg font-bold ">Recent Order</h2>
        <span>View all</span>
      </div>
      {orders.map((order) => (
        <OrderItem order={order} key={order.id} />
      ))}
    </div>
  );
};

export default RecentOrder;
