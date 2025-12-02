import React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  gradient?: "blue" | "green" | "purple" | "orange" | "red" | "cyan"
}

const gradientClasses = {
  blue: "from-blue-500 to-indigo-600",
  green: "from-green-500 to-emerald-600", 
  purple: "from-purple-500 to-violet-600",
  orange: "from-orange-500 to-amber-600",
  red: "from-red-500 to-pink-600",
  cyan: "from-cyan-500 to-teal-600"
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ 
    className, 
    title, 
    description, 
    icon: Icon, 
    actions,
    gradient = "blue",
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "scan-it-page-header bg-gradient-to-r from-white via-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg border border-gray-100 mb-8",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {Icon && (
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${gradientClasses[gradient]} shadow-lg`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
              {description && (
                <p className="text-lg text-gray-600">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    )
  }
)

PageHeader.displayName = "PageHeader"

export { PageHeader }