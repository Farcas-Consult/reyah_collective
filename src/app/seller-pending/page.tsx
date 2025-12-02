'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import BackButton from '@/components/BackButton'

export default function SellerPendingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Check if already approved
    if (user.isSeller && (user.sellerStatus === 'approved' || user.sellerApproved)) {
      router.push('/seller')
      return
    }

    // Check if rejected
    if (user.sellerStatus === 'rejected') {
      // Allow reapplication
      return
    }

    // Auto-check for approval every 5 seconds
    const interval = setInterval(() => {
      refreshUser()
      const updatedUser = JSON.parse(localStorage.getItem('reyah_user') || '{}')
      if (updatedUser.isSeller && (updatedUser.sellerStatus === 'approved' || updatedUser.sellerApproved)) {
        router.push('/seller')
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [user, router, refreshUser])

  const handleCheckStatus = () => {
    setChecking(true)
    refreshUser()
    
    setTimeout(() => {
      const updatedUser = JSON.parse(localStorage.getItem('reyah_user') || '{}')
      if (updatedUser.isSeller && (updatedUser.sellerStatus === 'approved' || updatedUser.sellerApproved)) {
        router.push('/seller')
      } else if (updatedUser.sellerStatus === 'rejected') {
        setChecking(false)
      } else {
        setChecking(false)
      }
    }, 1000)
  }

  const handleReapply = () => {
    router.push('/seller-setup')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <BackButton />
        
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {user.sellerStatus === 'rejected' ? (
            <>
              {/* Rejected Status */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">❌</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-4">
                Application Rejected
              </h1>
              
              <p className="text-gray-600 mb-6">
                Unfortunately, your seller application was not approved at this time.
                You can submit a new application if you'd like to try again.
              </p>

              <button
                onClick={handleReapply}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Apply Again
              </button>
            </>
          ) : (
            <>
              {/* Pending Status */}
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="text-4xl">⏳</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-4">
                Seller Request Pending
              </h1>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <p className="text-gray-700 mb-4">
                  Your seller application has been submitted and is awaiting admin approval.
                </p>
                <div className="text-left space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Seller Name:</span> {user.sellerName}
                  </p>
                  {user.businessDescription && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Business Description:</span> {user.businessDescription}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Submitted:</span>{' '}
                    {user.sellerRequestDate
                      ? new Date(user.sellerRequestDate).toLocaleDateString() +
                        ' at ' +
                        new Date(user.sellerRequestDate).toLocaleTimeString()
                      : 'Recently'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleCheckStatus}
                  disabled={checking}
                  className="w-full px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {checking ? 'Checking...' : 'Check Approval Status'}
                </button>

                <p className="text-sm text-gray-500">
                  This page will automatically refresh when your application is reviewed.
                  You'll receive access to the seller dashboard once approved.
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-bold text-[var(--brown-800)] mb-4">
                  What happens next?
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">1.</span>
                    <p className="text-sm text-gray-600">
                      An admin will review your seller application
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">2.</span>
                    <p className="text-sm text-gray-600">
                      Once approved, you'll gain access to the seller dashboard
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">3.</span>
                    <p className="text-sm text-gray-600">
                      You can start listing products and managing your store
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
