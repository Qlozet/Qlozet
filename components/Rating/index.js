import ReactStars from "react-stars";
import React from "react";
import { render } from "react-dom";

const Rating = () => {
  const ratingChanged = (newRating) => {};
  return (
    <div>
      <ReactStars
        count={5}
        onChange={ratingChanged}
        size={24}
        color2={"#FFB020"}
        value={4.8}
      />
    </div>
  );
};

export default Rating;
