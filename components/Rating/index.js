import ReactStars from "react-stars";
import React from "react";
import { render } from "react-dom";

const Rating = ({ newRating }) => {
  const ratingChanged = ({}) => {};
  return (
    <div>
      <ReactStars
        count={5}
        onChange={ratingChanged}
        size={24}
        color2={"#FFB020"}
        value={newRating}
      />
    </div>
  );
};

export default Rating;
