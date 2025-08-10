import React from 'react';

interface HorizontalChatBarProps {
  location: string;
  male: number;
  female: number;
}

const HorizontalChatBar: React.FC<HorizontalChatBarProps> = ({ location, male, female }) => {
  const getWidth = (value: number) => `${value < 55 ? value + 55 : value}%`;

  const renderBar = () => {
    if (male < female) {
      return (
        <div className="bg-primary-200 rounded-r-[2px] block" style={{ width: getWidth(female) }}>
          <div className="bg-primary rounded-r-[2px] block" style={{ width: getWidth(male) }}>
            <p className="py-1 px-2 text-white text-xs font-[550] max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
              {location}
            </p>
          </div>
        </div>
      );
    }
    if (male > female) {
      return (
        <div className="bg-primary rounded-r-[2px] block" style={{ width: getWidth(male) }}>
          <div className="bg-primary-200 rounded-r-[2px]" style={{ width: getWidth(female) }}>
            <p className="py-1 px-2 text-white text-xs font-[550] max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
              {location}
            </p>
          </div>
        </div>
      );
    }
    // male === female
    return (
      <div className="bg-primary rounded-r-[2px] block" style={{ width: getWidth(male) }}>
        <p className="py-1 px-2 text-white text-xs font-[550] max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
          {location}
        </p>
      </div>
    );
  };

  return (
    <div className="mb-4">
      <div>{renderBar()}</div>
    </div>
  );
};

export default HorizontalChatBar;