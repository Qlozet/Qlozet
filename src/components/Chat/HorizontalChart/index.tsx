import React from 'react';
import HorizontalChatBar from "../HorizontalChatBar";

interface ChartDataItem {
  location: string;
  male: number;
  female: number;
}

interface HorizontalChartProps {
  data: ChartDataItem[];
}

const HorizontalChart: React.FC<HorizontalChartProps> = ({ data }) => {
  return (
    <div className="h-[200px] overflow-y-auto">
      {data.map((item, index) => (
        <div className={`${index !== 0 && "mt-6"}`} key={index}>
          <HorizontalChatBar
            location={item.location}
            male={item.male}
            female={item.female}
          />
        </div>
      ))}
    </div>
  );
};

export default HorizontalChart;