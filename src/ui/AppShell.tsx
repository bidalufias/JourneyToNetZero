import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { roleTheme } from './roleTheme'
import type { RoleId } from '../game/types'

/**
 * Every screen sits in this. It pins the page background, the 20px page
 * padding and the 480px reading measure, and paints the role stripe when the
 * player has a seat — so the phone always says who you are.
 */
export function AppShell({
  children,
  role,
  wide = false,
  bleed,
  className = '',
}: {
  children: ReactNode
  role?: RoleId
  /** Big-screen board: drop the phone measure and use the full width. */
  wide?: boolean
  /** Full-width artwork rendered above the padded content. */
  bleed?: ReactNode
  className?: string
}) {
  return (
    <main className={`min-h-dvh bg-canvas ${className}`}>
      {role && (
        <div
          className="h-1 w-full"
          style={{ background: roleTheme(role).color }}
          aria-hidden="true"
        />
      )}
      {bleed}
      <div
        className={`screen-in mx-auto w-full ${wide ? '' : 'max-w-[var(--content-max)]'}`}
        style={{ padding: wide ? '20px 24px 32px' : '20px 20px 32px' }}
      >
        {children}
      </div>
    </main>
  )
}

/**
 * The standard top of a screen: a small eyebrow for context (round and year),
 * the title, and an optional slot on the right for the timer.
 */
export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  right,
  large = false,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
  large?: boolean
}) {
  // The right-hand slot (the timer, the role mark) sits on the eyebrow line so
  // the title always gets the full measure — on a 320px phone a title squeezed
  // beside a timer wraps to four lines.
  return (
    <header>
      {(eyebrow || right) && (
        <div className="flex min-h-6 items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[12px] font-medium text-muted">
            {eyebrow}
          </p>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}
      <h1
        className={`mt-1.5 font-bold tracking-[-0.015em] text-navy ${
          large ? 'text-[40px] leading-[1.08]' : 'text-[28px] leading-[1.15]'
        }`}
      >
        {title}
      </h1>
      {subtitle && (
        <div className="mt-2 text-[15px] leading-6 text-body">{subtitle}</div>
      )}
    </header>
  )
}

/** A 20px-heading section with consistent spacing above it. */
export function Section({
  title,
  icon: Icon,
  children,
  className = '',
}: {
  title?: ReactNode
  icon?: LucideIcon
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`mt-6 ${className}`}>
      {title && (
        <h2 className="mb-3 flex items-center gap-2 text-[20px] leading-tight font-[650] text-navy">
          {Icon && <Icon size={20} strokeWidth={2} className="text-brand" aria-hidden="true" />}
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}

/**
 * Sticky footer for the confirming action. Keeps the primary control within
 * thumb reach without it floating over content it might hide.
 */
export function BottomActionArea({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-5 mt-6 border-t border-line bg-surface/95 px-5 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur-sm">
      <div className="space-y-3">{children}</div>
    </div>
  )
}
