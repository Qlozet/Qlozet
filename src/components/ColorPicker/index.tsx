import React, { useEffect, useState } from 'react';
import Typography from '../Typography';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/css';
const ColorInputContainer = ({ label, setValue, height = '200px', width }) => {
  const [colour, setColor] = useColor('#E89623');
  return (
    <div>
      <div>
        <ColorPicker
          //   color={colour}
          onChange={(currentColor) => {
            // setColor(currentColor);
            // setValue(currentColor.hex);
          }}
        />
      </div>
    </div>
  );
};

export default ColorInputContainer;
