import { type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: React.ReactNode
  className?: string
  isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-slate-700 text-white hover:bg-slate-600 border-slate-700',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200',
  danger: 'bg-red-600 text-white hover:bg-red-500 border-red-600',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border-transparent',
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  disabled,
  isLoading,
  ...props
}: ButtonProps) {
  return (
    <button
      type={props.type ?? 'button'}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border
        font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}
