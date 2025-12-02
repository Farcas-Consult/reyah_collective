'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import BackButton from '@/components/BackButton'

export default function SupplierPendingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!user.isSupplier) {
      router.push('/supplier-setup')
      return
    }

    if (user.supplierStatus === 'approved') {
      router.push('/supplier')
      return
    }
  }, [user, router])

  const checkStatus = () => {
    setIsChecking(true)
    
    const users = JSON.parse(localStorage.getItem('reyah_users') || '[]')
    const currentUser = users.find((u: any) => u.id === user?.id)
    
    if (currentUser && currentUser.supplierStatus === 'approved') {
      localStorage.setItem('reyah_user', JSON.stringify(currentUser))
      setTimeout(() => {
        router.push('/supplier')
      }, 500)
    } else {
      setTimeout(() => {
        setIsChecking(false)
      }, 1000)
    }
  }

  if (!user || !user.isSupplier) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <BackButton />
        
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">⏳</span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-2">
              Supplier Application Pending
            </h1>
            <p className="text-gray-600 text-lg">
              Your supplier application is awaiting admin approval
            </p>
          </div>

          <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-6 ${
            user.supplierStatus === 'pending' 
              ? 'bg-yellow-100 text-yellow-800'
              : user.supplierStatus === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}>
            Status: {user.supplierStatus?.toUpperCase()}
          </div>

          {user.supplierStatus === 'pending' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                An administrator will review your application soon. You'll be able to access 
                your supplier dashboard once approved.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 my-6">
                <h3 className="font-semibold text-[var(--brown-800)] mb-3">
                  Your Application Details:
                </h3>
                <div className="text-left space-y-2 text-sm">
                  <p><span className="font-semibold">Company Name:</span> {user.companyName}</p>
                  <p><span className="font-semibold">Supplier Type:</span> {user.supplierType}</p>
                </div>
              </div>

              <button
                onClick={checkStatus}
                disabled={isChecking}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
              >
                {isChecking ? 'Checking...' : 'Check Status'}
              </button>
            </div>
          )}

          {user.supplierStatus === 'rejected' && (
            <div className="bg-red-50 rounded-lg p-6">
              <p className="text-red-800 font-semibold mb-2">
                Your supplier application has been rejected.
              </p>
              <p className="text-red-700 text-sm">
                Please contact support for more information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
