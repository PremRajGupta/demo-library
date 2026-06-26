import { APP_LOGO_SRC } from '../lib/brand';
import { cn } from '../lib/utils';

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
} as const;

type AppLogoProps = {
  size?: keyof typeof sizeClasses;
  showName?: boolean;
  name?: string;
  className?: string;
  nameClassName?: string;
  alt?: string;
};

export default function AppLogo({
  size = 'md',
  showName = false,
  name,
  className,
  nameClassName,
  alt,
}: AppLogoProps) {
  const label = alt ?? (name ? `${name} logo` : 'Demo Library logo');

  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)}>
      <img
        src={APP_LOGO_SRC}
        alt={label}
        className={cn(sizeClasses[size], 'rounded-full object-cover flex-shrink-0')}
      />
      {showName && name ? (
        <span className={cn('font-semibold truncate', nameClassName)}>{name}</span>
      ) : null}
    </div>
  );
}
