import * as React from 'react'

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ className = '', ...props }, ref) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <input ref={ref} type="checkbox" className="sr-only peer" {...props} />
      <div className="w-10 h-6 bg-slate-300 peer-checked:bg-blue-600 rounded-full relative transition-colors">
        <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  )
})
Switch.displayName = 'Switch'

