import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type Base = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Leading icon. Always sits beside a text label, never replaces one. */
  icon?: LucideIcon
  /** Trailing icon, e.g. a chevron on a forward action. */
  trailingIcon?: LucideIcon
  /** Buttons fill their container by default; opt out for a side-by-side pair. */
  fullWidth?: boolean
  children: ReactNode
}

const SHARED =
  'inline-flex items-center justify-center gap-2.5 rounded-[var(--radius-button)] ' +
  'px-5 py-2 text-[16px] font-[650] transition-[transform,background-color,border-color,opacity] ' +
  'duration-[var(--t-interaction)] ease-out active:scale-[0.98] ' +
  'disabled:pointer-events-none disabled:opacity-40'

function Inner({
  icon: Icon,
  trailingIcon: Trailing,
  children,
}: Pick<Base, 'icon' | 'trailingIcon' | 'children'>) {
  return (
    <>
      {Icon && <Icon size={20} strokeWidth={2} aria-hidden="true" />}
      <span className="min-w-0 text-center leading-tight">{children}</span>
      {Trailing && (
        <Trailing size={20} strokeWidth={2} aria-hidden="true" className="ml-auto shrink-0" />
      )}
    </>
  )
}

/** Blue, white text, 56px. The one action the screen wants you to take. */
export function PrimaryButton({
  icon,
  trailingIcon,
  fullWidth = true,
  children,
  className = '',
  ...rest
}: Base) {
  return (
    <button
      type="button"
      {...rest}
      className={`${SHARED} ${fullWidth ? 'w-full' : ''} min-h-14 bg-brand text-white hover:bg-brand-dark ${className}`}
    >
      <Inner icon={icon} trailingIcon={trailingIcon}>
        {children}
      </Inner>
    </button>
  )
}

/** Green, white text, 56px. Used where the action is the sustainable path. */
export function SecondaryButton({
  icon,
  trailingIcon,
  fullWidth = true,
  children,
  className = '',
  ...rest
}: Base) {
  return (
    <button
      type="button"
      {...rest}
      className={`${SHARED} ${fullWidth ? 'w-full' : ''} min-h-14 bg-leaf text-white hover:bg-leaf-dark ${className}`}
    >
      <Inner icon={icon} trailingIcon={trailingIcon}>
        {children}
      </Inner>
    </button>
  )
}

/** White with a hairline border, navy text, 52px. */
export function TertiaryButton({
  icon,
  trailingIcon,
  fullWidth = true,
  children,
  className = '',
  ...rest
}: Base) {
  return (
    <button
      type="button"
      {...rest}
      className={`${SHARED} ${fullWidth ? 'w-full' : ''} min-h-[52px] border border-line-strong bg-surface text-navy hover:bg-surface-2 ${className}`}
    >
      <Inner icon={icon} trailingIcon={trailingIcon}>
        {children}
      </Inner>
    </button>
  )
}
