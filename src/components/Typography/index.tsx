import React from 'react';

// Define the props interface for the Typography component
interface TypographyProps extends React.HTMLAttributes<HTMLParagraphElement> {
  textSize?: string;
  textWeight?: string;
  children: React.ReactNode;
  textColor?: string;
  horizontalPadding?: string;
  verticalPadding?: string;
  align?: string;
  className?: string;
}

const Typography: React.FC<TypographyProps> = ({
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
      {...rest}
    >
      {children}
    </p>
  );
};

export default Typography;
