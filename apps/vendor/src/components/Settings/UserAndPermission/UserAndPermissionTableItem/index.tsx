import { useState } from 'react';
import threeDotIcon from '@/public/assets/svg/three-dot.svg';
import Image from 'next/image';
import OrderStatus from '@/components/order/OrderStatus';
import Modal from '@/components/Modal';
import DropDown from '@/components/DropDown';
import DropDownComponent from '@/components/DropDownComponent';
const UserAndPermissionTableItem = ({
  name,
  emailAddress,
  phoneNumber,
  role,
  status,
  handleEdit,
}) => {
  const [showDropDown, setShowDropDown] = useState(false);

  const selectDropDownHandler = (option) => {
    if (option == 'Edit user') {
      handleEdit();
    }
    setShowDropDown(false);
  };

  return (
    <tr className='border-b-[1.5px] border-solid border-gray-300 bg-white'>
      <td className='text-xs font-[400] p-4  text-dark'>{name}</td>
      <td className='text-xs font-[400] p-4  text-dark'>{emailAddress}</td>
      <td className='text-xs font-[400] p-4  text-dark'>{phoneNumber}</td>
      <td className='text-xs font-[400] p-4  text-dark'>{role}</td>
      <td className='text-xs font-[400] p-4  text-dark'>
        <OrderStatus
          text='Out for delivery'
          bgColor='bg-[#FFF7DE]'
          color='text-[#FFB020]'
          addMaxWidth={true}
        />
      </td>
      <td className='text-xs font-[400] p-4  text-dark relative '>
        <div
          className='cursor-pointer flex items-center justify-end pr-6'
          onClick={() => {
            setShowDropDown(true);
          }}
        >
          <Image src={threeDotIcon} alt='' />
        </div>
        {showDropDown && (
          <div className='absolute top-1 right-1'>
            <DropDownComponent
              dropdownTitle='Menu'
              width='w-[15rem]'
              data={['Edit user', 'Deactivate user']}
              clickHandler={selectDropDownHandler}
            />
          </div>
        )}
      </td>
    </tr>
  );
};

export default UserAndPermissionTableItem;
