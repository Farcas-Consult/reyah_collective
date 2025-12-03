'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import BackButton from '@/components/BackButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Order {
  id: string
  userId: string
  items: any[]
  total: number
  status: string
  createdAt: string
}

interface Rating {
  orderId: string
  userId: string
  userName: string
  sellerName: string
  rating: number
  review: string
  createdAt: string
}

export default function RateSellerPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadOrder()
    checkIfRated()
  }, [user, params.id])

  const loadOrder = () => {
    const orders = JSON.parse(localStorage.getItem('reyah_orders') || '[]')
    const foundOrder = orders.find((o: Order) => o.id === params.id && o.userId === user?.id)
    
    if (foundOrder) {
      setOrder(foundOrder)
    } else {
      router.push('/account/orders')
    }
  }

  const checkIfRated = () => {
    const ratings = JSON.parse(localStorage.getItem('reyah_ratings') || '[]')
    const existingRating = ratings.find((r: Rating) => r.orderId === params.id && r.userId === user?.id)
    
    if (existingRating) {
      setAlreadyRated(true)
      setRating(existingRating.rating)
      setReview(existingRating.review)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setLoading(true)

    // Get seller name from order items
    const products = JSON.parse(localStorage.getItem('reyah_products') || '[]')
    const orderProduct = order?.items[0]
    const product = products.find((p: any) => p.name === orderProduct?.name)
    const sellerName = product?.seller || 'Unknown Seller'

    const newRating: Rating = {
      orderId: params.id as string,
      userId: user?.id || '',
      userName: `${user?.firstName} ${user?.lastName}`,
      sellerName,
      rating,
      review,
      createdAt: new Date().toISOString()
    }

    const ratings = JSON.parse(localStorage.getItem('reyah_ratings') || '[]')
    
    if (alreadyRated) {
      // Update existing rating
      const updatedRatings = ratings.map((r: Rating) => 
        r.orderId === params.id && r.userId === user?.id ? newRating : r
      )
      localStorage.setItem('reyah_ratings', JSON.stringify(updatedRatings))
    } else {
      // Add new rating
      ratings.push(newRating)
      localStorage.setItem('reyah_ratings', JSON.stringify(ratings))
    }

    setLoading(false)
    alert(alreadyRated ? 'Rating updated successfully!' : 'Thank you for your rating!')
    router.push('/account/orders')
  }

  if (!user || !order) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <BackButton />
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-6">
              {alreadyRated ? 'Update Your Rating' : 'Rate Your Experience'}
            </h1>

            <div className="bg-[var(--beige-100)] rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Order #{order.id}</p>
              <p className="font-semibold text-[var(--brown-800)]">
                {order.items.length} item(s) - KSH {order.total.toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-[var(--brown-800)] font-semibold mb-3">
                  How would you rate your experience?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="text-5xl focus:outline-none transition-all"
                    >
                      <span
                        className={
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {rating === 0 && 'Click to rate'}
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-[var(--brown-800)] font-semibold mb-2">
                  Share your experience (optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell us about your experience with this seller..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
                  rows={5}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-[var(--brown-800)] text-white rounded-lg hover:bg-[var(--brown-700)] transition-colors font-semibold disabled:bg-gray-400"
                >
                  {loading ? 'Submitting...' : alreadyRated ? 'Update Rating' : 'Submit Rating'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/account/orders')}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
