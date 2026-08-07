import React from 'react';
import ReactStars from 'react-stars';

interface RatingProps {
  newRating?: number;
}

/**
 * Read-only star display.
 *
 * `edit` MUST stay false: react-stars defaults it to `true`, which makes the
 * row a live input — the stars are text characters (★), so clicking them drops
 * a text caret, dragging selects them, and hovering previews a rating that
 * isn't the real value. This is a display, not a control.
 */
const Rating: React.FC<RatingProps> = ({ newRating }) => {
  return (
    <div className="select-none">
      <ReactStars
        count={5}
        edit={false}
        size={24}
        color2={'#FFB020'}
        value={newRating ?? 0}
      />
    </div>
  );
};

export default Rating;
