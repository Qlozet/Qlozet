// Global type declarations for static assets and modules

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

declare module '*.ico' {
  const value: string;
  export default value;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Additional global type declarations for common libraries
declare global {
  interface Window {
    google?: any;
    gapi?: any;
    gtag?: (...args: any[]) => void;
  }
}

// Type declarations for libraries that might not have types
declare module 'react-pick-color' {
  interface ColorPickerProps {
    color?: string;
    onChange?: (color: string) => void;
    hideAdvanced?: boolean;
    hideColorGuide?: boolean;
    hideInputs?: boolean;
  }
  const ColorPicker: React.FC<ColorPickerProps>;
  export default ColorPicker;
}

declare module 'react-stars' {
  interface ReactStarsProps {
    count?: number;
    value?: number;
    onChange?: (rating: number) => void;
    size?: number;
    color1?: string;
    color2?: string;
    half?: boolean;
    edit?: boolean;
    char?: string;
  }
  const ReactStars: React.FC<ReactStarsProps>;
  export default ReactStars;
}

declare module 'react-custom-checkbox' {
  interface CheckboxProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    icon?: React.ReactNode;
    size?: number;
    color?: string;
    borderColor?: string;
    borderRadius?: number;
    className?: string;
  }
  const Checkbox: React.FC<CheckboxProps>;
  export default Checkbox;
}

declare module 'react-json-to-csv' {
  interface CsvDownloadProps {
    data: any[];
    filename?: string;
    delimiter?: string;
    headers?: string[];
    className?: string;
    children?: React.ReactNode;
  }
  const CsvDownload: React.FC<CsvDownloadProps>;
  export default CsvDownload;
}

declare module 'export-from-json' {
  interface ExportOptions {
    data: any;
    name?: string;
    type?: 'json' | 'csv' | 'xls' | 'txt';
    fields?: string[];
  }
  function exportFromJSON(options: ExportOptions): void;
  export default exportFromJSON;
}

declare module 'quil' {
  const content: any;
  export default content;
}
