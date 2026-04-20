import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { SignInButton } from '@/components/SignInButton'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          career<span className="text-indigo-600">ops</span>
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          AI-powered job search pipeline — evaluate offers, track applications, generate tailored CVs.
        </p>
        <SignInButton />
        <p className="text-xs text-gray-400 mt-6">
          Your data is encrypted and never shared.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl w-full">
        {[
          { icon: '⚡', title: 'AI Evaluation', desc: 'Claude scores every JD across 7 dimensions against your CV' },
          { icon: '📊', title: 'Pipeline Tracking', desc: 'Full application lifecycle from inbox to offer' },
          { icon: '🎯', title: 'Smart Targeting', desc: 'Only apply where score ≥ 4.0 — quality over quantity' },
        ].map(f => (
          <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center">
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="text-sm font-bold mb-1">{f.title}</div>
            <div className="text-xs text-gray-500">{f.desc}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
