import Image from 'next/image';
import brownLogo from '@/public/assets/image/logobrown.png';
import whiteLogo from '@/public/assets/image/logowhite.png';
import React from 'react';

// Define the props interface for the Logo component
interface LogoProps {
  brown?: boolean;
  white?: boolean;
}

const Logo: React.FC<LogoProps> = ({ brown, white }) => {
  return (
    <div>
      {white ? (
        <div className='items-center justify-center lg:justify-start flex'>
          <Image
            src={whiteLogo}
            alt='Qlozet Logo'
            style={{ width: '100px', height: 'auto' }}
            priority
          />
        </div>
      ) : brown ? (
        <div className='items-center justify-center lg:justify-start flex'>
          <Image
            src={brownLogo}
            alt='Qlozet Logo'
            style={{
              width: '100px',
              height: 'auto',
            }}
            priority
          />
        </div>
      ) : (
        <div>
          <div className='items-center justify-center lg:justify-start hidden lg:flex'>
            <Image
              src={brownLogo}
              alt='Qlozet Logo'
              style={{
                width: '100px',
                height: 'auto',
              }}
              priority
            />
          </div>
          <div className='items-center justify-center lg:justify-start flex lg:hidden'>
            <Image
              src={whiteLogo}
              alt='Qlozet Logo'
              style={{
                width: '100px',
                height: 'auto',
              }}
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
