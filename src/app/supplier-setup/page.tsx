'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import BackButton from '@/components/BackButton'

export default function SupplierSetupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    supplierName: '',
    supplierCompany: '',
    supplierDescription: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.isSupplier && user.supplierStatus === 'approved') {
      router.push('/supplier')
      return
    }

    if (user.isSupplier && user.supplierStatus === 'pending') {
      router.push('/supplier-pending')
      return
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.supplierName || !formData.supplierCompany) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      setIsSubmitting(false)
      return
    }

    try {
      const users = JSON.parse(localStorage.getItem('reyah_users') || '[]')
      const updatedUsers = users.map((u: any) => {
        if (u.id === user?.id) {
          return {
            ...u,
            isSupplier: true,
            supplierName: formData.supplierName,
            supplierCompany: formData.supplierCompany,
            supplierDescription: formData.supplierDescription,
            supplierStatus: 'pending'
          }
        }
        return u
      })

      localStorage.setItem('reyah_users', JSON.stringify(updatedUsers))
      
      const updatedUser = updatedUsers.find((u: any) => u.id === user?.id)
      localStorage.setItem('reyah_user', JSON.stringify(updatedUser))

      setMessage({ 
        type: 'success', 
        text: 'Your supplier application has been submitted and is pending admin approval!' 
      })

      setTimeout(() => {
        router.push('/supplier-pending')
      }, 2000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit application. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <BackButton />
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-2">
              Become a Supplier
            </h1>
            <p className="text-gray-600">
              Supply products to Reyah Collective and reach more customers
            </p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Your name or business owner name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.supplierCompany}
                  onChange={(e) => setFormData({ ...formData, supplierCompany: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Your company or supplier business name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                  Business Description
                </label>
                <textarea
                  value={formData.supplierDescription}
                  onChange={(e) => setFormData({ ...formData, supplierDescription: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  rows={4}
                  placeholder="Tell us about the products you supply, your experience, etc."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-[var(--brown-800)] mb-2">Supplier Benefits:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Supply products to multiple sellers on the platform</li>
              <li>• Manage your product inventory and pricing</li>
              <li>• Track supplier orders and deliveries</li>
              <li>• View sales analytics and reports</li>
              <li>• Expand your business reach</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
