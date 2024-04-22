import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import classes from "./index.module.css";
import ChatLabel from "../ChatLabel";
const DonutChart = ({ data, width, height }) => {
  const chartRef = useRef(null);
  let chartInstance = null;

  useEffect(() => {
    if (chartRef && chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
          datasets: [
            {
              label: "Donut Chart",
              data: data.values,
              backgroundColor: data.colors,
            },
          ],
        },
        options: {
          cutoutPercentage: 50,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom", // Change the position of the labels (e.g., 'top', 'bottom', 'left', 'right')
              labels: {
                radius: 50, // Set the radius of the labels to 50%
                spacing: 100,
                padding: 50,
              },
            },
          },
        },
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [data]);

  return (
    <div>
      <div>
        <canvas ref={chartRef} width={width} height={height}></canvas>
      </div>
    </div>
  );
};

export default DonutChart;
