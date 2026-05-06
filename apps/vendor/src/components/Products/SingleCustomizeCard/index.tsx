import ToolTip from '@/components/ToolTip';
import Typography from '@/components/Typography';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const SingleCustomzeCard = ({ text, ToolTipText, children }) => {
  const [showChilderen, setShowChildren] = useState(false);
  return (
    <div>
      <div
        className='flex items-center gap-4'
        onClick={() => {
          setShowChildren(!showChilderen);
        }}
      >
        <Typography
          textColor='text-sectionHeader'
          textWeight='font-semibold'
          textSize='text-[14px]'
          verticalPadding={0}
        >
          {text}
        </Typography>
        <ToolTip />
        <button className='w-[5%]'>
          {showChilderen ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>
      {showChilderen && (
        <div className='border-solid border-borderColor border rounded-[12px] p-[15px] mt-[10px]'>
          {children}
        </div>
      )}
    </div>
  );
};

export default SingleCustomzeCard;
