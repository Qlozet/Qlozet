const Typography = ({
  textSize,
  textWeight,
  children,
  textColor,
  horizontalPadding,
  verticalPadding,
  align,
  className,
  ...rest
}) => {
  return (
    <p
      className={`${textSize} ${textColor} ${textWeight} ${align} ${horizontalPadding} ${verticalPadding} ${className}`}
    >
      {children}
    </p>
  );
};

export default Typography;
