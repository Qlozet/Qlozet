import { useState } from 'react';
import Typography from '@/components/Typography';
import Button from '@/components/Button';

import SearchInput from '@/components/SearchInput';
import { Info, Plus, X } from 'lucide-react';
import SelectedCheckBox from '@/components/SelectedCheckBox';
const CustomizeOrder = ({ closeModal, styleData, formik }) => {
  const [currentNav, setCurrentNav] = useState('Tops');
  const [gender, setGender] = useState('Male');
  const styles = ['Tops', 'Dresses', 'Bottoms', 'Neck', 'Sleeves', 'Full Fit'];
  const stylesBottom = ['Round', 'V-shaped', 'High', 'Low', 'Collared'];

  return (
    <div className='flex flex-col items-center justify-center w-full my-4 '>
      <div className='bg-white  w-full lg:w-[775px] rounded-[16px]'>
        <div className='flex items-center justify-between border-dashed border-b-[1.5px] border-gray-300 mx-6'>
          <div className='w-[85%] flex items-center '>
            <div className='w-56'>
              <Typography textWeight={'font-500'}>Select Styles</Typography>
            </div>
            <SearchInput />
          </div>
          <button
            className='bg-transparent border-none flex items-center'
            onClick={closeModal}
          >
            <X />
          </button>
        </div>
        <div className='my-6 flex items-center justify-end px-4'>
          <Button
            children={
              <span className='flex justify-center items-center gap-4 text-sm'>
                Add Style <Plus className='text-dark' size={16} />
              </span>
            }
            btnSize='small'
            variant='outline'
            clickHandler={() => {
              clearProductId();
            }}
          />
        </div>

        <div className='bg-primary-300 rounded-[12px] flex items-center px-3 py-3 gap-4 mx-6'>
          <button className=' w-8 h-8 bg-[#CBC2BB] rounded-[12px] flex items-center justify-center'>
            <Info />
          </button>
          <div>
            <p className='text-sm text-[#808192] '>
              Choose the styles you would like to present to your customers
            </p>
          </div>
        </div>
        <div className='bg-[#ECEBEB] p-6 rounded-md grid grid-cols-7 gap-x-2 gap-y-4 mx-6 mt-6'>
          {formik?.values?.styles.map((item) => (
            <div>
              <div
                className={`flex items-center justify-center flex-col gap-4 bg-white py-8 rounded-[8px] cursor-pointer  relative`}
                onClick={() => {}}
              >
                <SelectedCheckBox top={8} right={8} />
                <img src={item.imageUrl} className='h-[45px] w-auto' />
              </div>
            </div>
          ))}
        </div>
        <div className='flex items-center justify-start px-4 mt-6'>
          <div className='bg-[#F6F6F6]  rounded-xl flex items-center font-medium text-[14px]'>
            <button
              className={`${
                gender === 'Male' ? 'bg-primary text-white' : 'text-[#495057]'
              } flex items-center gap-2 px-4 py-2 rounded-tl-xl rounded-bl-xl`}
              onClick={() => {
                setGender('Male');
              }}
            >
              <span>Male</span>
            </button>
            <button
              onClick={() => {
                setGender('Female');
              }}
              className={`${
                gender === 'Female' ? 'bg-primary text-white' : 'text-[#495057]'
              } flex items-center gap-2  px-4 py-2 rounded-tr-xl rounded-br-xl`}
            >
              <span>Female</span>
            </button>
          </div>
        </div>
        <div className='my-6 px-6'>
          <div className='flex items-center mx-6'>
            {styles.map((item, index) => (
              <span
                key={index}
                className={`h-[40px] px-3 flex items-center justify-center text-sm font-medium cursor-pointer rounded-t-[10px] ${
                  currentNav === item ? 'bg-[#F8F8F8F8]' : 'text-[#495057]'
                }`}
                onClick={() => setCurrentNav(item)}
              >
                {item}
              </span>
            ))}
          </div>
          <div className='bg-[#F8F8F8F8] pt-[2px] rounded-tr-[10px] rounded-tl-[10px]'>
            <div className='bg-[#F8F8F8F1]'>
              <div className='flex items-center mt-1 '>
                {stylesBottom.map((item, index) => (
                  <span
                    key={index}
                    className={`h-[40px] px-3 flex items-center justify-center text-sm font-medium cursor-pointer rounded-t-[10px] ${
                      currentNav === item ? 'bg-[#ECEBEB]' : ''
                    }`}
                    onClick={() => setCurrentNav(item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className=' bg-[#ECEBEB] p-6 rounded-bl-[10px] rounded-br-[10px]'>
                <div className='grid grid-cols-7 gap-x-2 gap-y-4 '>
                  {styleData.map((item) => (
                    <div
                      className={` ${
                        formik.values.styles.filter(
                          (formikStyle) => formikStyle._id === item?._id
                        ).length > 0
                          ? 'bg-[#3E1C0114] p-1  rounded-[8px]'
                          : ''
                      }`}
                      onClick={() => {
                        const existingStyles = formik.values.styles;
                        const exists = existingStyles.some(
                          (style) => style._id === item._id
                        );
                        const updatedStyles = exists
                          ? existingStyles.filter(
                              (style) => style._id !== item._id
                            )
                          : [...existingStyles, item];

                        formik.setFieldValue('styles', updatedStyles);
                      }}
                    >
                      <div
                        className={`flex relative items-center justify-center flex-col gap-4 bg-white py-6 rounded-[8px] cursor-pointer 
                     ${
                       formik.values.styles.filter(
                         (formikStyle) => formikStyle._id === item?._id
                       ).length > 0
                         ? 'border-solid border-primary border'
                         : ''
                     }`}
                        onClick={() => {}}
                      >
                        {formik.values.styles.filter(
                          (formikStyle) => formikStyle._id === item?._id
                        ).length > 0 && <SelectedCheckBox top={8} right={8} />}
                        <img src={item.imageUrl} className='h-[45px] w-auto' />
                        <p className='text-[10px]'>{item.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className='mt-6'>
            <Button
              minWidth={'200px'}
              children={
                <span className='flex justify-center items-center '>Close</span>
              }
              btnSize='small'
              variant='primary'
              clickHandler={closeModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomizeOrder;
