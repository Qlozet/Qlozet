import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ToolTip from '../ToolTip';

interface SelectOption {
  id: string | number;
  text: string;
}

interface SelectInputProps {
  value: string;
  placeholder?: string;
  setValue: (value: string, id?: string | number) => void;
  data: SelectOption[];
  label: string;
  index?: number;
  error?: boolean;
  readOnly?: boolean;
  tooltips?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  value,
  placeholder,
  setValue,
  data,
  label,
  index,
  error,
  readOnly,
  tooltips,
}) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const [list, setList] = useState<SelectOption[]>(data);
  const dropDownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setList(data);
  }, [data]);

  const filterList = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.toLowerCase();
    setValue(e.target.value);
    setList(
      data.filter((item) => item.text.toLowerCase().includes(inputValue))
    );
  };

  return (
    <div
      className={`bg-white w-full relative my-2`}
      style={{ zIndex: index ? index : 10 }}
    >
      <div className='w-full relative border-solid'>
        <div className='flex items-center justify-start gap-2'>
          <label className='text-sm my-2 text-dark'>{label}</label>
          {tooltips && <ToolTip text={`${label} is required`} />}
        </div>

        <div
          className={`border-solid border-[4px] rounded-[12px] ${showDropDown ? 'border-[#3E1C0114]' : 'border-white'}`}
        >
          <input
            readOnly={readOnly}
            onChange={filterList}
            onClick={() => setShowDropDown(true)}
            onBlur={(e) => {
              if (
                dropDownRef.current &&
                !dropDownRef.current.contains(e.relatedTarget as Node)
              ) {
                setShowDropDown(false);
              }
            }}
            placeholder={placeholder}
            value={value}
            className={`py-3 ${error ? 'border-danger' : ''} px-4 w-full border-solid border-[1.5px] placeholder-gray-200 text-dark focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-sm text-font-light placeholder:font-300`}
          />
        </div>

        <div className='absolute top-[50px] right-2'>
          {showDropDown ? <ChevronUp /> : <ChevronDown />}
        </div>
        {error && (
          <p className='text-danger text-xs font-[400]'>
            {label} cannot be empty!
          </p>
        )}
      </div>

      {showDropDown && (
        <div
          className='cursor-pointer absolute top-[73px] bg-white rounded-lg max-h-[15rem] datalist-scroll shadow-md w-full'
          ref={dropDownRef}
        >
          {list.map((item, idx) => (
            <div
              key={item.id}
              tabIndex={0}
              className={`px-2 py-3 ${idx !== 0 ? 'border-t-[1px] border-solid border-gray-200' : ''} hover:bg-[#F4F4F4]`}
              onClick={() => {
                setValue(item.text, item.id);
                setShowDropDown(false);
              }}
            >
              <p className='rounded-b-[12px] overflow-hidden text-xs pl-1'>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectInput;
