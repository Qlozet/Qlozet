const Typography = ({
  textSize,
  textWeight,
  children,
  textColor,
  horizontalPadding,
  verticalPadding,
  align,
  ...rest
}) => {
  return (
    <p
      className={`${textSize} ${textColor} ${textWeight} ${align} ${horizontalPadding} ${verticalPadding}`}
    >
      {children}
    </p>
  );
};

export default Typography;
