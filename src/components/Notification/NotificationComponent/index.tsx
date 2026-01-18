import moment from 'moment';
import Typography from '../../Typography';
import { useState, useRef } from 'react';
import { useMarkNotificationAsViewedMutation } from '@/redux/services/notifications/notifications.api-slice';
const Notification = ({ id, read, title, desc, date }) => {
  const notificationElement = useRef();
  const [isOpen, setIsOpen] = useState(true);
  const [isRead, setIsred] = useState(read);
  const [markAsViewed] = useMarkNotificationAsViewedMutation();

  const handleOpen = async () => {
    if (!read) {
      try {
        setIsOpen(!isOpen);
        setIsred(true);
        await markAsViewed(id).unwrap();
      } catch (error) {
        console.error('Error marking notification as viewed:', error);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };
  return (
    <div
      className='block lg:flex items-center justify-between  py-4 lg:py-0 px-6 lg:px-0 cursor-pointer'
      onClick={handleOpen}
    >
      <div className='border-solid border-gray-300 border-b-[1px] pb-1 flex flex-col lg:flex-row lg:justify-between w-full lg:px-6 lg:pt-7 lg:pb-4'>
        <div className='flex items-start gap-2  '>
          <div className='flex items-start '>
            <div
              className={`w-[1rem] h-[1rem] ml-0 lg:mr-6 mt-[5px] ${
                !isRead ? 'bg-dark' : 'bg-[#DDE2E5]'
              }  rounded-[50%] `}
            ></div>
          </div>
          <div className='ml-4 lg:ml-0'>
            <div className='mb-[7px]'>
              {' '}
              <Typography
                textColor='text-black'
                textWeight='font-bold'
                textSize='text-[14px] lg:text-[18px]'
              >
                {title}
              </Typography>
            </div>
            {isOpen && (
              <Typography
                textColor='text-black'
                textWeight='font-normal'
                textSize='text-sm '
              >
                {desc}
              </Typography>
            )}
          </div>
        </div>
        <div className='ml-10 lg:ml-0 py-3 lg:py-0 flex items-end'>
          <Typography
            textWeight='font-normal'
            textSize='text-sm'
            textColor='text-[#495057]'
          >
            {moment(date).format('MMMM DD,YYYY HH:mm')}{' '}
            {moment(date, 'HH:mm').format('A')}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default Notification;
