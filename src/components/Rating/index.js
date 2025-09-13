import React from "react";
import ReactStars from "react-stars";
const Rating = ({ newRating }) => {
  const ratingChanged = ({ }) => { };
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
