const CategoryTable = ({ handleEdit }) => {
  const data = [
    {
      name: "Hello",
    },
  ];
  return (
    <table className="w-full">
      <thead className="w-full bg-[#F4F4F4] ">
        <tr>
          <th className="w-[8%] p-4 text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Name
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
            <td className="text-[12px] font-[400] p-4"> {item.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CategoryTable;
