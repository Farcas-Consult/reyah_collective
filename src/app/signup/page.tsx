'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

type UserRole = 'customer' | 'seller' | 'supplier';

export default function SignupPage() {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Customer fields
    firstName: '',
    lastName: '',
    paymentMethod: '',
    
    // Seller fields
    businessName: '',
    businessType: '',
    bankAccount: '',
    kraPin: '',
    
    // Supplier fields
    companyName: '',
    companyType: '',
    registrationNumber: '',
  });
  const [documents, setDocuments] = useState<{
    idDocument?: string;
    businessCertificate?: string;
    kraDocument?: string;
  }>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    setStep('details');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocuments({
          ...documents,
          [docType]: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Common validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    let userData: any = {
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: selectedRole,
    };

    // Role-specific data
    if (selectedRole === 'customer') {
      if (!formData.firstName || !formData.lastName) {
        setError('Please provide your name');
        setLoading(false);
        return;
      }
      userData = {
        ...userData,
        firstName: formData.firstName,
        lastName: formData.lastName,
        paymentMethod: formData.paymentMethod,
      };
    } else if (selectedRole === 'seller') {
      if (!formData.businessName || !formData.businessType || !formData.bankAccount) {
        setError('Please fill in all business details');
        setLoading(false);
        return;
      }
      if (!documents.idDocument || !documents.businessCertificate) {
        setError('Please upload all required documents');
        setLoading(false);
        return;
      }
      userData = {
        ...userData,
        firstName: formData.businessName.split(' ')[0],
        lastName: formData.businessName.split(' ').slice(1).join(' ') || 'Business',
        isSeller: true,
        sellerApproved: false,
        sellerName: formData.businessName,
        businessType: formData.businessType,
        bankAccount: formData.bankAccount,
        kraPin: formData.kraPin,
        documents: documents,
      };
    } else if (selectedRole === 'supplier') {
      if (!formData.companyName || !formData.companyType || !formData.bankAccount) {
        setError('Please fill in all company details');
        setLoading(false);
        return;
      }
      if (!documents.idDocument || !documents.businessCertificate) {
        setError('Please upload all required documents');
        setLoading(false);
        return;
      }
      userData = {
        ...userData,
        firstName: formData.companyName.split(' ')[0],
        lastName: formData.companyName.split(' ').slice(1).join(' ') || 'Company',
        isSupplier: true,
        supplierApproved: false,
        companyName: formData.companyName,
        companyType: formData.companyType,
        registrationNumber: formData.registrationNumber,
        bankAccount: formData.bankAccount,
        documents: documents,
      };
    }

    const success = await signup(userData);

    if (success) {
      if (selectedRole === 'customer') {
        router.push('/account');
      } else if (selectedRole === 'seller') {
        router.push('/seller-pending');
      } else if (selectedRole === 'supplier') {
        router.push('/supplier-pending');
      }
    } else {
      setError('Email already exists. Please login instead.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--beige-100)] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="mb-4">
          <BackButton />
        </div>
        
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <div className="text-4xl font-bold">
            <span className="text-[var(--brown-800)]">REYAH</span>
            <span className="text-[var(--accent)] text-5xl">⭐</span>
          </div>
        </Link>

        {/* Signup Card */}
        <div className="bg-white rounded-lg shadow-lg border border-[var(--beige-300)] p-8">
          {step === 'role' ? (
            <>
              <h1 className="text-2xl font-bold text-[var(--brown-800)] mb-2 text-center">Choose Your Role</h1>
              <p className="text-[var(--brown-700)] text-center mb-8">Select how you want to join Reyah Collective</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Customer Card */}
                <button
                  onClick={() => handleRoleSelection('customer')}
                  className="p-6 border-2 border-[var(--beige-300)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--beige-50)] transition-all group"
                >
                  <div className="text-4xl mb-3">🛍️</div>
                  <h3 className="font-bold text-lg text-[var(--brown-800)] mb-2">Customer</h3>
                  <p className="text-sm text-[var(--brown-700)]">Shop unique handcrafted products</p>
                </button>

                {/* Seller Card */}
                <button
                  onClick={() => handleRoleSelection('seller')}
                  className="p-6 border-2 border-[var(--beige-300)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--beige-50)] transition-all group"
                >
                  <div className="text-4xl mb-3">🏪</div>
                  <h3 className="font-bold text-lg text-[var(--brown-800)] mb-2">Seller</h3>
                  <p className="text-sm text-[var(--brown-700)]">Sell your products to thousands</p>
                </button>

                {/* Supplier Card */}
                <button
                  onClick={() => handleRoleSelection('supplier')}
                  className="p-6 border-2 border-[var(--beige-300)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--beige-50)] transition-all group"
                >
                  <div className="text-4xl mb-3">📦</div>
                  <h3 className="font-bold text-lg text-[var(--brown-800)] mb-2">Supplier</h3>
                  <p className="text-sm text-[var(--brown-700)]">Supply products to our marketplace</p>
                </button>
              </div>

              <p className="text-center mt-6 text-sm text-[var(--brown-700)]">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--accent)] hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('role')}
                className="mb-4 text-[var(--accent)] hover:underline flex items-center gap-2"
              >
                ← Change role
              </button>
              
              <h1 className="text-2xl font-bold text-[var(--brown-800)] mb-2 text-center">
                {selectedRole === 'customer' && 'Customer Registration'}
                {selectedRole === 'seller' && 'Seller Registration'}
                {selectedRole === 'supplier' && 'Supplier Registration'}
              </h1>
              <p className="text-[var(--brown-700)] text-center mb-6">
                Complete your profile to get started
              </p>

              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Common Fields */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                    placeholder="+254 700 000 000"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>

                {/* Customer-specific fields */}
                {selectedRole === 'customer' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        Payment Method (Optional)
                      </label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                      >
                        <option value="">Select payment method</option>
                        <option value="mpesa">M-Pesa</option>
                        <option value="card">Credit/Debit Card</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Seller-specific fields */}
                {selectedRole === 'seller' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                        placeholder="Your Business Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        Business Type *
                      </label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                        required
                      >
                        <option value="">Select type</option>
                        <option value="individual">Individual</option>
                        <option value="company">Company</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        Bank Account Number *
                      </label>
                      <input
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                        placeholder="1234567890"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        KRA PIN
                      </label>
                      <input
                        type="text"
                        name="kraPin"
                        value={formData.kraPin}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                        placeholder="A000000000X"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        ID/Passport Document *
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, 'idDocument')}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                        required
                      />
                      {documents.idDocument && <p className="text-xs text-green-600 mt-1">✓ Document uploaded</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        Business Registration Certificate *
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, 'businessCertificate')}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                        required
                      />
                      {documents.businessCertificate && <p className="text-xs text-green-600 mt-1">✓ Document uploaded</p>}
                    </div>
                  </>
                )}

                {/* Supplier-specific fields */}
                {selectedRole === 'supplier' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                        placeholder="Your Company Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        Company Type *
                      </label>
                      <select
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                        required
                      >
                        <option value="">Select type</option>
                        <option value="llc">Limited Liability Company</option>
                        <option value="partnership">Partnership</option>
                        <option value="sole">Sole Proprietorship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                        placeholder="Company registration number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        Bank Account Number *
                      </label>
                      <input
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                        placeholder="1234567890"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        ID/Passport Document *
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, 'idDocument')}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                        required
                      />
                      {documents.idDocument && <p className="text-xs text-green-600 mt-1">✓ Document uploaded</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                        Certificate of Incorporation *
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, 'businessCertificate')}
                        className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                        required
                      />
                      {documents.businessCertificate && <p className="text-xs text-green-600 mt-1">✓ Document uploaded</p>}
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[var(--accent)] to-[var(--brown-600)] text-white py-3 rounded-md font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 
                   selectedRole === 'customer' ? 'Create Account' : 
                   'Submit for Verification'}
                </button>

                {(selectedRole === 'seller' || selectedRole === 'supplier') && (
                  <p className="text-xs text-center text-[var(--brown-700)] mt-2">
                    Your account will be reviewed by our team. You'll be notified once approved.
                  </p>
                )}
              </form>

              <p className="text-center mt-6 text-sm text-[var(--brown-700)]">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--accent)] hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
