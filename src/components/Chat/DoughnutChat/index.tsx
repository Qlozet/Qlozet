import React, { useEffect, useRef } from "react";
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the necessary components for a doughnut chart
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: {
    values: number[];
    colors: string[];
  };
  width?: number;
  height?: number;
  cutout?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, width, height, cutout }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            datasets: [
              {
                label: "Gender chart",
                data: data.values,
                backgroundColor: data.colors,
              },
            ],
          },
          options: {
            cutout: cutout ? 60 : 0,
            responsive: true,
            maintainAspectRatio: false,
            borderWidth: 0,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 20, // Adjust padding as needed
                },
              },
            },
          },
        });
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, cutout]);

  return (
    <div>
      <div className="">
        <canvas ref={chartRef} width={width} height={height}></canvas>
      </div>
    </div>
  );
};

export default DonutChart;