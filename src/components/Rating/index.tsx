import React from "react";
import ReactStars from "react-stars";

interface RatingProps {
  newRating?: number;
}

const Rating: React.FC<RatingProps> = ({ newRating }) => {
  const ratingChanged = (newRating: number): void => {};

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
