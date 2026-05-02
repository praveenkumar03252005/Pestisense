import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, MapPin, CheckCircle, XCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FarmerReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ pesticide: 'all', area: '' });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.pesticide !== 'all') params.append('pesticide_id', filter.pesticide);
    if (filter.area) params.append('area', filter.area);
    
    setLoading(true);
    fetch('/api/reviews?' + params.toString())
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Pesticide</label>
          <select 
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold text-sm"
            value={filter.pesticide}
            onChange={e => setFilter({ ...filter, pesticide: e.target.value })}
          >
            <option value="all">All Pesticides</option>
            <option value="mancozeb">Mancozeb 75% WP</option>
            <option value="carbendazim">Carbendazim 50% WP</option>
            <option value="copper">Copper Oxychloride</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Area / Village</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by area..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold text-sm"
              value={filter.area}
              onChange={e => setFilter({ ...filter, area: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-gray-400 font-bold uppercase tracking-widest">Searching reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-400 font-bold uppercase tracking-widest bg-gray-50 rounded-3xl border border-dashed border-gray-200">No reviews found for this selection</div>
        ) : (
          <AnimatePresence>
            {reviews.map((r, i) => (
              <motion.div 
                key={r._id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-black text-lg">
                      {r.reviewer_name?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{r.reviewer_name}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {r.reviewer_village}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pesticide Used</div>
                  <div className="text-sm font-bold text-green-700">{r.pesticide_name}</div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed font-medium italic">
                  "{r.review_text}"
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.cured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {r.cured ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {r.cured ? 'Disease Cured' : 'No Improvement'}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
