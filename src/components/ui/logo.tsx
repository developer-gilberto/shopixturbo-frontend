import Image, { type ImageProps } from 'next/image';

const LOGO_FULL_RATIO = 288 / 866;

interface LogoProps extends Omit<ImageProps, 'src' | 'alt'> {
  logoFull?: boolean;
}

export function Logo({
  logoFull = false,
  width,
  height,
  className,
  ...props
}: LogoProps) {
  const src = logoFull
    ? '/assets/logo/logo-full-866x288.png'
    : '/assets/logo/logo-512x512.png';

  const resolvedHeight =
    logoFull && typeof width === 'number'
      ? Math.round(width * LOGO_FULL_RATIO)
      : height;

  return (
    <Image
      src={src}
      alt="Logo ShopixTurbo"
      quality={100}
      priority
      width={width}
      height={resolvedHeight}
      className={className}
      {...props}
    />
  );
}
