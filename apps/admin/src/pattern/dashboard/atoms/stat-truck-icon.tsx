import React from 'react'

interface StatTruckIconProps {
    fill?: string;
}

// Delivery truck stat icon on a colored rounded-square background
export const StatTruckIcon = ({ fill = "#5DDAB4" }: StatTruckIconProps) => {
    return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="8" fill={fill} />
            <path d="M14 16.5C14 15.5335 14.7835 14.75 15.75 14.75H26.25C27.2165 14.75 28 15.5335 28 16.5V27.5H15.75C14.7835 27.5 14 26.7165 14 25.75V16.5Z" fill="white" />
            <path d="M28 19.25H31.18C31.8 19.25 32.36 19.6 32.64 20.15L33.96 22.79C34.07 23.01 34.13 23.25 34.13 23.49V25.75C34.13 26.7165 33.3465 27.5 32.38 27.5H28V19.25Z" fill="white" />
            <path d="M19 30.5C20.1046 30.5 21 29.6046 21 28.5C21 27.3954 20.1046 26.5 19 26.5C17.8954 26.5 17 27.3954 17 28.5C17 29.6046 17.8954 30.5 19 30.5Z" fill="white" />
            <path d="M30 30.5C31.1046 30.5 32 29.6046 32 28.5C32 27.3954 31.1046 26.5 30 26.5C28.8954 26.5 28 27.3954 28 28.5C28 29.6046 28.8954 30.5 30 30.5Z" fill="white" />
        </svg>
    )
}
