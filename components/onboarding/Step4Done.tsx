'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

export function Step4Done() {
  const router = useRouter()
  const { update } = useSession()

  useEffect(() => {
    // Trigger JWT refresh so middleware sees onboarded=true
    update()
  }, [update])

  return (
    <div className="w-full max-w-md text-center">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12">
        <div className="text-5xl mb-5">🎉</div>
        <h2 className="text-2xl font-bold mb-2">You&apos;re all set!</h2>
        <p className="text-sm text-gray-500 mb-8">
          Your profile, CV, and portals are configured. Start by evaluating a job description or browsing your pipeline.
        </p>
        <Button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11"
        >
          Go to Dashboard →
        </Button>
      </div>
    </div>
  )
}
