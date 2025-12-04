'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BackButton from '@/components/BackButton';
import type { ShippingZone, ShippingMethod, ShippingRate } from '@/types/shipping';

export default function AdminShipping() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'zones' | 'methods' | 'rates'>('zones');
  
  // Zones
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  
  // Methods
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [showMethodForm, setShowMethodForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  
  // Rates
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, user, router]);

  const loadData = async () => {
    const { getAllShippingZones, getAllShippingMethods, getAllShippingRates } = await import('@/utils/shippingUtils');
    setZones(getAllShippingZones());
    setMethods(getAllShippingMethods());
    setRates(getAllShippingRates());
  };

  const handleSaveZone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const countries = (formData.get('countries') as string).split(',').map(c => c.trim());
    
    const zoneData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      countries,
      isActive: formData.get('isActive') === 'true',
    };

    const { saveShippingZone, updateShippingZone } = await import('@/utils/shippingUtils');
    
    if (editingZone) {
      updateShippingZone(editingZone.id, zoneData);
    } else {
      saveShippingZone(zoneData);
    }
    
    setShowZoneForm(false);
    setEditingZone(null);
    loadData();
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Delete this shipping zone?')) return;
    const { deleteShippingZone } = await import('@/utils/shippingUtils');
    deleteShippingZone(id);
    loadData();
  };

  const handleSaveMethod = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const features = (formData.get('features') as string).split(',').map(f => f.trim()).filter(Boolean);
    
    const methodData = {
      name: formData.get('name') as string,
      type: formData.get('type') as any,
      carrier: formData.get('carrier') as any,
      description: formData.get('description') as string || undefined,
      estimatedDays: {
        min: parseInt(formData.get('minDays') as string),
        max: parseInt(formData.get('maxDays') as string),
      },
      zoneId: formData.get('zoneId') as string,
      isActive: formData.get('isActive') === 'true',
      features,
    };

    const { saveShippingMethod, updateShippingMethod } = await import('@/utils/shippingUtils');
    
    if (editingMethod) {
      updateShippingMethod(editingMethod.id, methodData);
    } else {
      saveShippingMethod(methodData);
    }
    
    setShowMethodForm(false);
    setEditingMethod(null);
    loadData();
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm('Delete this shipping method?')) return;
    const { deleteShippingMethod } = await import('@/utils/shippingUtils');
    deleteShippingMethod(id);
    loadData();
  };

  const handleSaveRate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const rateData: any = {
      methodId: formData.get('methodId') as string,
      name: formData.get('name') as string,
      baseRate: parseInt(formData.get('baseRate') as string),
      rateType: formData.get('rateType') as any,
      isActive: formData.get('isActive') === 'true',
    };

    if (formData.get('freeShippingThreshold')) {
      rateData.freeShippingThreshold = parseInt(formData.get('freeShippingThreshold') as string);
    }
    if (formData.get('handlingFee')) {
      rateData.handlingFee = parseInt(formData.get('handlingFee') as string);
    }
    if (formData.get('fuelSurcharge')) {
      rateData.fuelSurcharge = parseInt(formData.get('fuelSurcharge') as string);
    }

    const { saveShippingRate, updateShippingRate } = await import('@/utils/shippingUtils');
    
    if (editingRate) {
      updateShippingRate(editingRate.id, rateData);
    } else {
      saveShippingRate(rateData);
    }
    
    setShowRateForm(false);
    setEditingRate(null);
    loadData();
  };

  const handleDeleteRate = async (id: string) => {
    if (!confirm('Delete this shipping rate?')) return;
    const { deleteShippingRate } = await import('@/utils/shippingUtils');
    deleteShippingRate(id);
    loadData();
  };

  if (!isAuthenticated || !user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackButton />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Management</h1>
          <p className="text-gray-600">Configure shipping zones, methods, and rates</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('zones')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'zones'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Shipping Zones ({zones.length})
            </button>
            <button
              onClick={() => setActiveTab('methods')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'methods'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Shipping Methods ({methods.length})
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'rates'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Shipping Rates ({rates.length})
            </button>
          </div>

          <div className="p-6">
            {/* ZONES TAB */}
            {activeTab === 'zones' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Shipping Zones</h2>
                  <button
                    onClick={() => {
                      setEditingZone(null);
                      setShowZoneForm(true);
                    }}
                    className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--brown-600)]"
                  >
                    + Add Zone
                  </button>
                </div>

                {showZoneForm && (
                  <form onSubmit={handleSaveZone} className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">{editingZone ? 'Edit' : 'Add'} Zone</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingZone?.name}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Countries (comma-separated codes)</label>
                        <input
                          type="text"
                          name="countries"
                          defaultValue={editingZone?.countries.join(', ')}
                          placeholder="KE, UG, TZ"
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        name="description"
                        defaultValue={editingZone?.description}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isActive"
                          value="true"
                          defaultChecked={editingZone?.isActive ?? true}
                          className="rounded"
                        />
                        <span className="text-sm font-semibold text-gray-700">Active</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg font-semibold">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowZoneForm(false);
                          setEditingZone(null);
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {zones.map((zone) => (
                    <div key={zone.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900">{zone.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${zone.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {zone.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {zone.description && <p className="text-sm text-gray-600 mb-2">{zone.description}</p>}
                          <div className="flex flex-wrap gap-1">
                            {zone.countries.map((country) => (
                              <span key={country} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {country}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingZone(zone);
                              setShowZoneForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteZone(zone.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* METHODS TAB */}
            {activeTab === 'methods' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Shipping Methods</h2>
                  <button
                    onClick={() => {
                      setEditingMethod(null);
                      setShowMethodForm(true);
                    }}
                    className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--brown-600)]"
                  >
                    + Add Method
                  </button>
                </div>

                {showMethodForm && (
                  <form onSubmit={handleSaveMethod} className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">{editingMethod ? 'Edit' : 'Add'} Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingMethod?.name}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                        <select
                          name="type"
                          defaultValue={editingMethod?.type}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="standard">Standard</option>
                          <option value="express">Express</option>
                          <option value="overnight">Overnight</option>
                          <option value="international">International</option>
                          <option value="pickup">Pickup</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Carrier</label>
                        <select
                          name="carrier"
                          defaultValue={editingMethod?.carrier}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="dhl">DHL</option>
                          <option value="fedex">FedEx</option>
                          <option value="ups">UPS</option>
                          <option value="usps">USPS</option>
                          <option value="aramex">Aramex</option>
                          <option value="posta_kenya">Posta Kenya</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Zone</label>
                        <select
                          name="zoneId"
                          defaultValue={editingMethod?.zoneId}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          {zones.map((zone) => (
                            <option key={zone.id} value={zone.id}>{zone.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Min Days</label>
                        <input
                          type="number"
                          name="minDays"
                          defaultValue={editingMethod?.estimatedDays.min}
                          required
                          min="0"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Max Days</label>
                        <input
                          type="number"
                          name="maxDays"
                          defaultValue={editingMethod?.estimatedDays.max}
                          required
                          min="0"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        name="description"
                        defaultValue={editingMethod?.description}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Features (comma-separated)</label>
                      <input
                        type="text"
                        name="features"
                        defaultValue={editingMethod?.features?.join(', ')}
                        placeholder="Tracking, Insurance, Signature Required"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isActive"
                          value="true"
                          defaultChecked={editingMethod?.isActive ?? true}
                          className="rounded"
                        />
                        <span className="text-sm font-semibold text-gray-700">Active</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg font-semibold">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMethodForm(false);
                          setEditingMethod(null);
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {methods.map((method) => {
                    const zone = zones.find(z => z.id === method.zoneId);
                    return (
                      <div key={method.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-gray-900">{method.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${method.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {method.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{method.type}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>Carrier:</strong> {method.carrier}</p>
                              <p><strong>Zone:</strong> {zone?.name || 'Unknown'}</p>
                              <p><strong>Delivery:</strong> {method.estimatedDays.min}-{method.estimatedDays.max} days</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingMethod(method);
                                setShowMethodForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMethod(method.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RATES TAB */}
            {activeTab === 'rates' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Shipping Rates</h2>
                  <button
                    onClick={() => {
                      setEditingRate(null);
                      setShowRateForm(true);
                    }}
                    className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--brown-600)]"
                  >
                    + Add Rate
                  </button>
                </div>

                {showRateForm && (
                  <form onSubmit={handleSaveRate} className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">{editingRate ? 'Edit' : 'Add'} Rate</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingRate?.name}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Method</label>
                        <select
                          name="methodId"
                          defaultValue={editingRate?.methodId}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          {methods.map((method) => (
                            <option key={method.id} value={method.id}>{method.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Rate Type</label>
                        <select
                          name="rateType"
                          defaultValue={editingRate?.rateType}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="flat">Flat Rate</option>
                          <option value="weight_based">Weight Based</option>
                          <option value="price_based">Price Based</option>
                          <option value="item_based">Item Based</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Base Rate (KSH)</label>
                        <input
                          type="number"
                          name="baseRate"
                          defaultValue={editingRate?.baseRate}
                          required
                          min="0"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Free Shipping Threshold (KSH)</label>
                        <input
                          type="number"
                          name="freeShippingThreshold"
                          defaultValue={editingRate?.freeShippingThreshold}
                          min="0"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Handling Fee (KSH)</label>
                        <input
                          type="number"
                          name="handlingFee"
                          defaultValue={editingRate?.handlingFee}
                          min="0"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Surcharge (%)</label>
                        <input
                          type="number"
                          name="fuelSurcharge"
                          defaultValue={editingRate?.fuelSurcharge}
                          min="0"
                          max="100"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isActive"
                          value="true"
                          defaultChecked={editingRate?.isActive ?? true}
                          className="rounded"
                        />
                        <span className="text-sm font-semibold text-gray-700">Active</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg font-semibold">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRateForm(false);
                          setEditingRate(null);
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {rates.map((rate) => {
                    const method = methods.find(m => m.id === rate.methodId);
                    return (
                      <div key={rate.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-gray-900">{rate.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${rate.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {rate.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{rate.rateType}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>Method:</strong> {method?.name || 'Unknown'}</p>
                              <p><strong>Base Rate:</strong> KSH {rate.baseRate.toLocaleString()}</p>
                              {rate.freeShippingThreshold && (
                                <p><strong>Free Shipping Threshold:</strong> KSH {rate.freeShippingThreshold.toLocaleString()}</p>
                              )}
                              {rate.handlingFee && (
                                <p><strong>Handling Fee:</strong> KSH {rate.handlingFee.toLocaleString()}</p>
                              )}
                              {rate.fuelSurcharge && (
                                <p><strong>Fuel Surcharge:</strong> {rate.fuelSurcharge}%</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingRate(rate);
                                setShowRateForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRate(rate.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
