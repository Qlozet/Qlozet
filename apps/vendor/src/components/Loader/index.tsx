import { FC } from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  small?: boolean;
  height?: number;
  width?: number;
}

const Loader: FC<LoaderProps> = ({ small = false, height, width }) => {
  return (
    <div
      className={`${small ? 'bg-[#DDE2E5] dark:bg-muted/30' : 'h-screen w-full bg-[#F8F9FA] dark:bg-background'
        } flex items-center justify-center max-w-[1324px] m-auto`}
    >
      <Loader2
        className='animate-spin text-[#5C2D0D] dark:text-gray-300'
        size={height ? height : 48}
      />
    </div>
  );
};

export default Loader;
