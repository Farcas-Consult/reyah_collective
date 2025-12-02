'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import BackButton from '@/components/BackButton'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  isSupplier?: boolean
  supplierName?: string
  supplierCompany?: string
  supplierDescription?: string
  supplierStatus?: 'pending' | 'approved' | 'rejected'
}

export default function AdminSuppliersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    supplierName: '',
    supplierCompany: '',
    supplierDescription: ''
  })

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/login')
      return
    }
    
    loadSuppliers()
  }, [user, router])

  const loadSuppliers = () => {
    const users = JSON.parse(localStorage.getItem('reyah_users') || '[]')
    const supplierUsers = users.filter((u: User) => u.isSupplier)
    setSuppliers(supplierUsers)
  }

  const handleApprove = (supplierId: string) => {
    const users = JSON.parse(localStorage.getItem('reyah_users') || '[]')
    const updatedUsers = users.map((u: User) => {
      if (u.id === supplierId) {
        return { ...u, supplierStatus: 'approved' }
      }
      return u
    })
    
    localStorage.setItem('reyah_users', JSON.stringify(updatedUsers))
    
    // Update current user if it's them
    const currentUser = JSON.parse(localStorage.getItem('reyah_user') || '{}')
    if (currentUser.id === supplierId) {
      currentUser.supplierStatus = 'approved'
      localStorage.setItem('reyah_user', JSON.stringify(currentUser))
    }
    
    loadSuppliers()
  }

  const handleReject = (supplierId: string) => {
    const users = JSON.parse(localStorage.getItem('reyah_users') || '[]')
    const updatedUsers = users.map((u: User) => {
      if (u.id === supplierId) {
        return { ...u, supplierStatus: 'rejected' }
      }
      return u
    })
    
    localStorage.setItem('reyah_users', JSON.stringify(updatedUsers))
    
    // Update current user if it's them
    const currentUser = JSON.parse(localStorage.getItem('reyah_user') || '{}')
    if (currentUser.id === supplierId) {
      currentUser.supplierStatus = 'rejected'
      localStorage.setItem('reyah_user', JSON.stringify(currentUser))
    }
    
    loadSuppliers()
  }

  const handleRemoveSupplier = (supplierId: string) => {
    if (!confirm('Are you sure you want to remove supplier status from this user?')) {
      return
    }

    const users = JSON.parse(localStorage.getItem('reyah_users') || '[]')
    const updatedUsers = users.map((u: User) => {
      if (u.id === supplierId) {
        const { isSupplier, supplierName, supplierCompany, supplierDescription, supplierStatus, ...rest } = u
        return rest
      }
      return u
    })
    
    localStorage.setItem('reyah_users', JSON.stringify(updatedUsers))
    loadSuppliers()
  }

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || 
        !formData.supplierName || !formData.supplierCompany) {
      alert('Please fill all required fields')
      return
    }

    const users = JSON.parse(localStorage.getItem('reyah_users') || '[]')
    
    // Check if email already exists
    if (users.some((u: User) => u.email === formData.email)) {
      alert('Email already exists')
      return
    }

    const newSupplier: User = {
      id: Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      isSupplier: true,
      supplierName: formData.supplierName,
      supplierCompany: formData.supplierCompany,
      supplierDescription: formData.supplierDescription,
      supplierStatus: 'approved'
    }

    users.push(newSupplier)
    localStorage.setItem('reyah_users', JSON.stringify(users))
    
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      supplierName: '',
      supplierCompany: '',
      supplierDescription: ''
    })
    setShowAddForm(false)
    loadSuppliers()
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.supplierCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || supplier.supplierStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: suppliers.length,
    pending: suppliers.filter(s => s.supplierStatus === 'pending').length,
    approved: suppliers.filter(s => s.supplierStatus === 'approved').length,
    rejected: suppliers.filter(s => s.supplierStatus === 'rejected').length
  }

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
                <h1 className="text-3xl font-bold text-[var(--brown-800)]">Manage Suppliers</h1>
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                  ADMIN
                </span>
              </div>
              <p className="text-gray-600">Approve and manage supplier accounts</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              {showAddForm ? 'Cancel' : '+ Add Supplier'}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Suppliers</p>
                <p className="text-3xl font-bold text-[var(--brown-800)] mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏭</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Suppliers</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
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
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Supplier Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-[var(--brown-800)] mb-4">Add New Supplier</h2>
            <form onSubmit={handleAddSupplier}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Business Description
                  </label>
                  <textarea
                    value={formData.supplierDescription}
                    onChange={(e) => setFormData({ ...formData, supplierDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Add Supplier (Auto-Approved)
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                Search Suppliers
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, company, or email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Suppliers List */}
        {filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No suppliers found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-[var(--brown-800)]">
                        {supplier.supplierName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        supplier.supplierStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        supplier.supplierStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {supplier.supplierStatus?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-semibold">Company:</span> {supplier.supplierCompany}</p>
                      <p><span className="font-semibold">Contact:</span> {supplier.firstName} {supplier.lastName}</p>
                      <p><span className="font-semibold">Email:</span> {supplier.email}</p>
                      {supplier.supplierDescription && (
                        <p><span className="font-semibold">Description:</span> {supplier.supplierDescription}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {supplier.supplierStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(supplier.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(supplier.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                        >
                          ✗ Reject
                        </button>
                      </>
                    )}
                    {supplier.supplierStatus === 'approved' && (
                      <button
                        onClick={() => handleReject(supplier.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                      >
                        ✗ Revoke
                      </button>
                    )}
                    {supplier.supplierStatus === 'rejected' && (
                      <button
                        onClick={() => handleApprove(supplier.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                      >
                        ✓ Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveSupplier(supplier.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm"
                    >
                      🗑️ Remove
                    </button>
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
