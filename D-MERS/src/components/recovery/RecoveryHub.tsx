import React, { useEffect, useState } from 'react';
import { RecoveryResource, UserProfile } from '../../types';
import { DataProvider } from '../../lib/supabase';
import { HeartHandshake, Plus, CheckCircle2, Package, Droplets, Utensils, Stethoscope, Home, Shirt, Wrench } from 'lucide-react';

interface RecoveryHubProps {
  currentUser: UserProfile;
}

export const RecoveryHub: React.FC<RecoveryHubProps> = ({ currentUser }) => {
  const [resources, setResources] = useState<RecoveryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'request' | 'offer'>('all');
  const [form, setForm] = useState({
    type: 'request' as 'request' | 'offer',
    category: 'water' as RecoveryResource['category'],
    title: '',
    description: '',
    quantity: '',
    location: '',
    contact_name: currentUser.full_name,
    contact_phone: currentUser.phone || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await DataProvider.getRecoveryResources();
    setResources(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await DataProvider.createRecoveryResource({ ...form, user_id: currentUser.id });
    setSubmitting(false);
    setShowForm(false);
    setForm({ ...form, title: '', description: '', quantity: '', location: '' });
    loadData();
  };

  const handleFulfill = async (id: string) => {
    await DataProvider.fulfillRecoveryResource(id);
    loadData();
  };

  const getCategoryIcon = (category: RecoveryResource['category']) => {
    switch (category) {
      case 'water': return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'food': return <Utensils className="w-5 h-5 text-orange-600" />;
      case 'medical': return <Stethoscope className="w-5 h-5 text-red-600" />;
      case 'shelter': return <Home className="w-5 h-5 text-purple-600" />;
      case 'clothing': return <Shirt className="w-5 h-5 text-indigo-600" />;
      case 'tools': return <Wrench className="w-5 h-5 text-gray-600" />;
      default: return <Package className="w-5 h-5 text-slate-600" />;
    }
  };

  const filtered = resources.filter(r => activeFilter === 'all' || r.type === activeFilter);
  const requestCount = resources.filter(r => r.type === 'request' && r.status === 'open').length;
  const offerCount = resources.filter(r => r.type === 'offer' && r.status === 'open').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-700 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/15 rounded-2xl border border-white/25">
              <HeartHandshake className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Community Recovery Hub</h2>
              <p className="text-amber-100 text-sm">Post-Disaster Resource Sharing & Relief Supply Management</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-red-200">{requestCount}</div>
              <div className="text-xs text-amber-100">Open Requests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-300">{offerCount}</div>
              <div className="text-xs text-amber-100">Available Offers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeFilter === 'all' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}>All ({resources.length})</button>
          <button onClick={() => setActiveFilter('request')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeFilter === 'request' ? 'bg-white text-red-800 shadow' : 'text-slate-500'}`}>Requests ({requestCount})</button>
          <button onClick={() => setActiveFilter('offer')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeFilter === 'offer' ? 'bg-white text-emerald-800 shadow' : 'text-slate-500'}`}>Offers ({offerCount})</button>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition shadow-md"
        >
          <Plus className="w-4 h-4" /> Post Request / Offer
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6">
          <h3 className="font-extrabold text-orange-900 mb-4">Post New Resource Request / Offer</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-orange-900 mb-1.5">Type</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="type" value="request" checked={form.type === 'request'} onChange={() => setForm({ ...form, type: 'request' })} />
                  <span className="font-bold text-red-700">I Need Help (Request)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="type" value="offer" checked={form.type === 'offer'} onChange={() => setForm({ ...form, type: 'offer' })} />
                  <span className="font-bold text-emerald-700">I Can Help (Offer)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-orange-900 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as RecoveryResource['category'] })} className="w-full p-2.5 rounded-xl border border-orange-200 focus:outline-none">
                <option value="water">Drinking Water</option>
                <option value="food">Food / Dry Rations</option>
                <option value="medical">Medical Supplies</option>
                <option value="shelter">Temporary Shelter</option>
                <option value="clothing">Clothing / Blankets</option>
                <option value="tools">Tools / Equipment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-orange-900 mb-1">Quantity / Amount</label>
              <input required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 50 Crates, 100 Kg, 5 Tarpaulins" className="w-full p-2.5 rounded-xl border border-orange-200 focus:outline-none" />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-orange-900 mb-1">Title / Subject</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief description of what you need or can provide" className="w-full p-2.5 rounded-xl border border-orange-200 focus:outline-none" />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-orange-900 mb-1">Detailed Description</label>
              <textarea required rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2.5 rounded-xl border border-orange-200 focus:outline-none" />
            </div>

            <div>
              <label className="block font-semibold text-orange-900 mb-1">Pickup / Delivery Location</label>
              <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Relief Camp, LB Nagar" className="w-full p-2.5 rounded-xl border border-orange-200 focus:outline-none" />
            </div>

            <div>
              <label className="block font-semibold text-orange-900 mb-1">Contact Phone</label>
              <input required value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} placeholder="+91 98765 43210" className="w-full p-2.5 rounded-xl border border-orange-200 focus:outline-none" />
            </div>

            <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs">Cancel</button>
              <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700">
                {submitting ? 'Submitting...' : 'Post Resource'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resource Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading resources...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(res => (
            <div key={res.id} className={`bg-white rounded-3xl border shadow-card hover:shadow-card-hover transition overflow-hidden ${res.status === 'fulfilled' ? 'opacity-60' : ''}`}>
              <div className={`h-1.5 ${res.type === 'request' ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${res.type === 'request' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                      {getCategoryIcon(res.category)}
                    </div>
                    <div>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${res.type === 'request' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {res.type === 'request' ? '⬇ NEEDS HELP' : '⬆ OFFERING'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-1 rounded-xl border ${res.status === 'open' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
                    {res.status === 'open' ? 'OPEN' : '✓ FULFILLED'}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{res.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{res.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div><span className="font-semibold">Qty:</span> {res.quantity}</div>
                  <div><span className="font-semibold">Location:</span> {res.location}</div>
                  <div className="col-span-2"><span className="font-semibold">Contact:</span> {res.contact_name} — {res.contact_phone}</div>
                </div>

                {res.status === 'open' && currentUser.role === 'admin' && (
                  <button
                    onClick={() => handleFulfill(res.id)}
                    className="w-full py-2 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark as Fulfilled
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
