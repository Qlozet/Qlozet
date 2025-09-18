const CategoryTable = ({ handleEdit }) => {
  const data = [
    {
      name: 'Hello',
    },
  ];
  return (
    <table className='w-full'>
      <thead className='w-full bg-[#F4F4F4] '>
        <tr>
          <th className='w-[8%] p-4 text-xs'>
            <div className='flex items-center justify-start font-medium'>
              Name
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr className='border-b-[1.5px] border-solid border-gray-300 bg-white'>
            <td className='text-xs font-[400] p-4'>
              <div className='flex items-center gap-4 '>
                <div
                  style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-1738240506194-9964c864b684)`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                  className='w-12 h-14'
                ></div>
                <p> {item.name}</p>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CategoryTable;
