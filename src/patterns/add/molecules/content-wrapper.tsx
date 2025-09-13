// Content Wrapper - Molecule
// Wraps content with optional card layout

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ContentWrapperProps {
  children: React.ReactNode;
  useCard?: boolean;
  cardClassName?: string;
  contentClassName?: string;
  className?: string;
}

export const ContentWrapper: React.FC<ContentWrapperProps> = ({ 
  children,
  useCard = true,
  cardClassName = "",
  contentClassName = "",
  className = ""
}) => {
  if (useCard) {
    return (
      <div className={`pb-8 ${className}`}>
        <Card className={`border-0 shadow-sm ${cardClassName}`}>
          <CardContent className={`p-8 ${contentClassName}`}>
            {children}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`pb-8 ${className}`}>
      {children}
    </div>
  );
};