const { default: Typography } = require("../Typography");

const StypePositioning = ({
  selectedStyles,
  handleSetCurentStyle,
  stylesType,
  customeStylesUiPosition,
  imageIndex,
}) => {
  return (
    <div>
      {selectedStyles.filter((item) => item.name === stylesType).length > 0 && (
        <div
          onTouchStart={() => {
            handleSetCurentStyle(stylesType, imageIndex);
          }}
          onMouseDown={() => {
            handleSetCurentStyle(stylesType, imageIndex);
          }}
          className="relative bg-[#0D0C0CBD] rounded-md px-6 py-2 cursor-move w-[5rem] mb-4"
          style={{
            position: customeStylesUiPosition.filter(
              (item) =>
                item.imageIndex === imageIndex && item.style === stylesType
            ).length
              ? "absolute"
              : "relative",
            left:
              customeStylesUiPosition.filter(
                (item) =>
                  item.imageIndex === imageIndex && item.style === stylesType
              ).length > 0 &&
              `${customeStylesUiPosition.filter(
                (item) =>
                  item.imageIndex === imageIndex && item.style === stylesType
              )[
                customeStylesUiPosition.filter(
                  (item) =>
                    item.imageIndex === imageIndex &&
                    item.style === stylesType
                ).length - 1
              ].left
              }px`,
            top:
              customeStylesUiPosition.filter(
                (item) =>
                  item.imageIndex === imageIndex && item.style === stylesType
              ).length > 0 &&
              `${customeStylesUiPosition.filter(
                (item) =>
                  item.imageIndex === imageIndex && item.style === stylesType
              )[
                customeStylesUiPosition.filter(
                  (item) =>
                    item.imageIndex === imageIndex &&
                    item.style === stylesType
                ).length - 1
              ].top
              }px`,
          }}
        >
          <Typography
            textColor="text-white"
            textWeight="font-medium"
            textSize="text-xs"
          >
            {stylesType}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default StypePositioning;
