import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-7 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-base font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href}>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  )
}
