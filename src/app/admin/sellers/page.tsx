'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, User } from '@/context/AuthContext'
import BackButton from '@/components/BackButton'

export default function AdminSellersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [sellers, setSellers] = useState<User[]>([])
  const [pendingSellers, setPendingSellers] = useState<User[]>([])
  const [approvedSellers, setApprovedSellers] = useState<User[]>([])
  const [rejectedSellers, setRejectedSellers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  
  const [newSellerData, setNewSellerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    sellerName: '',
    businessDescription: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (!user.isAdmin) {
      router.push('/')
      return
    }
    
    loadSellers()
  }, [user, router])

  const loadSellers = () => {
    const usersData = localStorage.getItem('reyah_users')
    if (usersData) {
      const allUsers = JSON.parse(usersData)
      const sellerUsers = allUsers.filter((u: User) => u.isSeller)
      
      setSellers(sellerUsers)
      setPendingSellers(sellerUsers.filter((u: User) => u.sellerStatus === 'pending' && !u.sellerApproved))
      setApprovedSellers(sellerUsers.filter((u: User) => u.sellerStatus === 'approved' || u.sellerApproved))
      setRejectedSellers(sellerUsers.filter((u: User) => u.sellerStatus === 'rejected'))
    }
  }

  const approveSeller = (sellerId: string) => {
    const usersData = localStorage.getItem('reyah_users')
    if (usersData) {
      const users = JSON.parse(usersData)
      const updatedUsers = users.map((u: User) => {
        if (u.id === sellerId) {
          return {
            ...u,
            sellerStatus: 'approved',
            sellerApproved: true
          }
        }
        return u
      })
      
      localStorage.setItem('reyah_users', JSON.stringify(updatedUsers))
      
      // Update the user's session if they're currently logged in
      const currentUser = localStorage.getItem('reyah_user')
      if (currentUser) {
        const parsed = JSON.parse(currentUser)
        if (parsed.id === sellerId) {
          parsed.sellerStatus = 'approved'
          parsed.sellerApproved = true
          localStorage.setItem('reyah_user', JSON.stringify(parsed))
        }
      }
      
      loadSellers()
      alert('Seller approved successfully!')
    }
  }

  const rejectSeller = (sellerId: string) => {
    if (!confirm('Are you sure you want to reject this seller application?')) {
      return
    }
    
    const usersData = localStorage.getItem('reyah_users')
    if (usersData) {
      const users = JSON.parse(usersData)
      const updatedUsers = users.map((u: User) => {
        if (u.id === sellerId) {
          return {
            ...u,
            sellerStatus: 'rejected',
            sellerApproved: false
          }
        }
        return u
      })
      
      localStorage.setItem('reyah_users', JSON.stringify(updatedUsers))
      
      // Update the user's session if they're currently logged in
      const currentUser = localStorage.getItem('reyah_user')
      if (currentUser) {
        const parsed = JSON.parse(currentUser)
        if (parsed.id === sellerId) {
          parsed.sellerStatus = 'rejected'
          parsed.sellerApproved = false
          localStorage.setItem('reyah_user', JSON.stringify(parsed))
        }
      }
      
      loadSellers()
      alert('Seller application rejected.')
    }
  }

  const removeSeller = (sellerId: string) => {
    if (!confirm('Are you sure you want to remove seller privileges from this user?')) {
      return
    }
    
    const usersData = localStorage.getItem('reyah_users')
    if (usersData) {
      const users = JSON.parse(usersData)
      const updatedUsers = users.map((u: User) => {
        if (u.id === sellerId) {
          const { isSeller, sellerName, businessDescription, sellerStatus, sellerApproved, sellerRequestDate, ...rest } = u
          return rest
        }
        return u
      })
      
      localStorage.setItem('reyah_users', JSON.stringify(updatedUsers))
      
      // Update session if needed
      const currentUser = localStorage.getItem('reyah_user')
      if (currentUser) {
        const parsed = JSON.parse(currentUser)
        if (parsed.id === sellerId) {
          const { isSeller, sellerName, businessDescription, sellerStatus, sellerApproved, sellerRequestDate, ...rest } = parsed
          localStorage.setItem('reyah_user', JSON.stringify(rest))
        }
      }
      
      loadSellers()
      alert('Seller privileges removed.')
    }
  }

  const handleAddSeller = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newSellerData.email || !newSellerData.password || !newSellerData.firstName || 
        !newSellerData.lastName || !newSellerData.sellerName) {
      alert('Please fill in all required fields')
      return
    }
    
    const usersData = localStorage.getItem('reyah_users')
    const users = usersData ? JSON.parse(usersData) : []
    
    // Check if email already exists
    if (users.some((u: User) => u.email === newSellerData.email)) {
      alert('Email already exists!')
      return
    }
    
    const newSeller: User = {
      id: Date.now().toString(),
      firstName: newSellerData.firstName,
      lastName: newSellerData.lastName,
      email: newSellerData.email,
      phone: newSellerData.phone,
      isSeller: true,
      sellerName: newSellerData.sellerName,
      businessDescription: newSellerData.businessDescription,
      sellerStatus: 'approved',
      sellerApproved: true,
      sellerRequestDate: new Date().toISOString()
    }
    
    users.push({ ...newSeller, password: newSellerData.password })
    localStorage.setItem('reyah_users', JSON.stringify(users))
    
    setNewSellerData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      sellerName: '',
      businessDescription: ''
    })
    
    setShowAddForm(false)
    loadSellers()
    alert('Seller account created and approved!')
  }

  const getFilteredSellers = () => {
    let filtered = sellers
    
    if (selectedTab === 'pending') {
      filtered = pendingSellers
    } else if (selectedTab === 'approved') {
      filtered = approvedSellers
    } else if (selectedTab === 'rejected') {
      filtered = rejectedSellers
    }
    
    if (searchTerm) {
      filtered = filtered.filter((s: User) =>
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.sellerName && s.sellerName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    return filtered
  }

  const filteredSellers = getFilteredSellers()

  if (!user || !user.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[var(--brown-800)]">Manage Sellers</h1>
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                  ADMIN
                </span>
              </div>
              <p className="text-gray-600">Approve seller applications and manage seller accounts</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              {showAddForm ? 'Cancel' : '+ Add Seller'}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sellers</p>
                <p className="text-3xl font-bold text-[var(--brown-800)] mt-1">{sellers.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏪</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingSellers.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{approvedSellers.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{rejectedSellers.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Seller Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-[var(--brown-800)] mb-4">Add New Seller</h2>
            <form onSubmit={handleAddSeller}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={newSellerData.firstName}
                    onChange={(e) => setNewSellerData({ ...newSellerData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={newSellerData.lastName}
                    onChange={(e) => setNewSellerData({ ...newSellerData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newSellerData.email}
                    onChange={(e) => setNewSellerData({ ...newSellerData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newSellerData.phone}
                    onChange={(e) => setNewSellerData({ ...newSellerData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newSellerData.password}
                    onChange={(e) => setNewSellerData({ ...newSellerData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Seller/Business Name *
                  </label>
                  <input
                    type="text"
                    value={newSellerData.sellerName}
                    onChange={(e) => setNewSellerData({ ...newSellerData, sellerName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Business Description
                  </label>
                  <textarea
                    value={newSellerData.businessDescription}
                    onChange={(e) => setNewSellerData({ ...newSellerData, businessDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Create Seller Account
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Seller will be automatically approved and can access their dashboard immediately.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                selectedTab === 'pending'
                  ? 'text-yellow-600 border-b-2 border-yellow-600 bg-yellow-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Pending ({pendingSellers.length})
            </button>
            <button
              onClick={() => setSelectedTab('approved')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                selectedTab === 'approved'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Approved ({approvedSellers.length})
            </button>
            <button
              onClick={() => setSelectedTab('rejected')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                selectedTab === 'rejected'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Rejected ({rejectedSellers.length})
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                selectedTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All ({sellers.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
            Search Sellers
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or business name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
          />
        </div>

        {/* Sellers List */}
        {filteredSellers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No sellers found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSellers.map((seller) => (
              <div key={seller.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-[var(--brown-800)]">
                        {seller.sellerName}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        seller.sellerStatus === 'approved' || seller.sellerApproved
                          ? 'bg-green-100 text-green-800'
                          : seller.sellerStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {seller.sellerStatus === 'approved' || seller.sellerApproved 
                          ? 'APPROVED' 
                          : seller.sellerStatus === 'rejected' 
                          ? 'REJECTED' 
                          : 'PENDING'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Name:</span> {seller.firstName} {seller.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Email:</span> {seller.email}
                        </p>
                        {seller.phone && (
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Phone:</span> {seller.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Applied:</span>{' '}
                          {seller.sellerRequestDate
                            ? new Date(seller.sellerRequestDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                        {seller.businessDescription && (
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Description:</span> {seller.businessDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {(seller.sellerStatus === 'pending' && !seller.sellerApproved) && (
                        <>
                          <button
                            onClick={() => approveSeller(seller.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => rejectSeller(seller.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      
                      {(seller.sellerStatus === 'approved' || seller.sellerApproved) && (
                        <button
                          onClick={() => removeSeller(seller.id)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm"
                        >
                          Remove Seller Access
                        </button>
                      )}
                      
                      {seller.sellerStatus === 'rejected' && (
                        <button
                          onClick={() => approveSeller(seller.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                        >
                          Approve Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
