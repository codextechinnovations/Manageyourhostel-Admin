import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, MapPin, Users, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { adminService } from '../../services/adminService';
import { Hostel } from '../../types/api';

const getOwnerInfo = (ownerId: Hostel['ownerId']) => {
  if (typeof ownerId === 'string') return { name: '-', phone: '-' };
  return { name: ownerId?.name || '-', phone: ownerId?.phone || '-' };
};

export function HostelOnboarding() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHostels, setSelectedHostels] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  const [cityFilter, setCityFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchUnverifiedHostels();
  }, [page, cityFilter]);

  const fetchUnverifiedHostels = async () => {
    try {
      setLoading(true);
      const response = await adminService.getHostels({ 
        page, 
        limit,
        verification: 'unverified'
      });
      
      if (response.success) {
        setHostels(response.data || []);
        const total = response.total || response.pagination?.total || 0;
        setTotalPages(Math.ceil(total / limit) || 1);
        
        const uniqueCities = [...new Set((response.data || []).map((hostel: any) => hostel.city).filter(Boolean))] as string[];
        setCities(prev => {
          const allCities = [...prev, ...uniqueCities];
          return [...new Set(allCities)];
        });
      } else {
        setError(response.message || 'Failed to fetch Hostels');
      }
    } catch (err) {
      setError('Failed to fetch Hostels');
      console.error('Error fetching Hostels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHostel = (hostelId: string) => {
    setSelectedHostels(prev => 
      prev.includes(hostelId) 
        ? prev.filter(id => id !== hostelId)
        : [...prev, hostelId]
    );
  };

  const handleSelectAll = () => {
    if (selectedHostels.length === filteredHostels.length) {
      setSelectedHostels([]);
    } else {
      setSelectedHostels(filteredHostels.map(hostel => hostel._id));
    }
  };

  const handleSendMessages = async () => {
    if (selectedHostels.length === 0) {
      setSendResult({ success: false, message: 'Please select at least one Hostel' });
      return;
    }

    if (!confirm(`Send onboarding messages to ${selectedHostels.length} selected Hostel(s)?`)) {
      return;
    }

    try {
      setSending(true);
      setSendResult(null);
      
      const response = await adminService.sendOnboardingMessage(selectedHostels);
      
      if (response.success) {
        const successCount = response.results?.filter((r: any) => r.success).length || 0;
        setSendResult({ 
          success: true, 
          message: `Successfully sent ${successCount} message(s). Check results below.` 
        });
        setSelectedHostels([]);
      } else {
        setSendResult({ success: false, message: response.message || 'Failed to send messages' });
      }
    } catch (err: any) {
      setSendResult({ success: false, message: err.response?.data?.message || 'Failed to send messages' });
    } finally {
      setSending(false);
    }
  };

  const filteredHostels = hostels.filter(hostel => {
    if (cityFilter && hostel.city !== cityFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        hostel.name?.toLowerCase().includes(search) ||
        hostel.city?.toLowerCase().includes(search) ||
        getOwnerInfo(hostel.ownerId).name.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div>
      {sendResult && (
        <div className={`mb-4 p-4 rounded-lg ${
          sendResult.success 
            ? 'bg-green-500/10 border border-green-500/20 text-green-500' 
            : 'bg-red-500/10 border border-red-500/20 text-red-500'
        }`}>
          <p>{sendResult.message}</p>
        </div>
      )}

      <PageHeader
        title="Hostel Onboarding Messages"
        description="Send WhatsApp onboarding messages to unverified Hostels"
        action={
          <button
            onClick={handleSendMessages}
            disabled={selectedHostels.length === 0 || sending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
              selectedHostels.length === 0 || sending
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:shadow-xl text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : `Send to ${selectedHostels.length} Hostel(s)`}
          </button>
        }
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4 mb-6"
      >
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Hostel name, city, or owner..."
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="ml-auto text-sm text-muted-foreground">
            {selectedHostels.length} selected
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="bg-card/50 backdrop-blur-xl rounded-xl border border-border overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 text-center">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={selectedHostels.length === filteredHostels.length && filteredHostels.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-border"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Hostel Name</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Owner</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">City</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHostels.map((hostel) => (
                    <tr key={hostel._id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedHostels.includes(hostel._id)}
                          onChange={() => handleSelectHostel(hostel._id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{hostel.name}</div>
                        <div className="text-xs text-muted-foreground">{hostel.address}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{getOwnerInfo(hostel.ownerId).name}</div>
                        <div className="text-xs text-muted-foreground">{getOwnerInfo(hostel.ownerId).phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{hostel.city || '-'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 capitalize">
                          {hostel.type}
                        </span>
                      </td>
                      <td className="p-4">
                        {hostel.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-green-500 text-sm">
                            <CheckCircle className="w-4 h-4" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-500 text-sm">
                            <Clock className="w-4 h-4" /> Unverified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredHostels.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No unverified Hostels found</p>
              </div>
            )}

            <div className="flex items-center justify-between p-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {filteredHostels.length} Hostels
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-lg border border-border hover:bg-accent disabled:opacity-50 text-sm"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-lg border border-border hover:bg-accent disabled:opacity-50 text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="mt-6 bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Message Template Preview
        </h3>
        <div className="bg-muted/30 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">Template: hostel_onboarding_demo</p>
          <div className="space-y-2 text-muted-foreground">
            <p><strong>Hi {`{owner_name}`} 👋</strong></p>
            <p>We've identified your Hostel as a good fit for listing on GetYourStay — a verified stay platform</p>
            <p className="mt-2"><strong>Our Platforms:</strong></p>
            <p>• GetYourStay → https://www.getyourstay.in</p>
            <p>• Hostel Management App → https://www.manageyourhostel.com</p>
            <p className="mt-2"><strong>We are currently onboarding selected Hostel owners and offering:</strong></p>
            <p>✅ Listing on GetYourStay</p>
            <p>✅ FREE website for your Hostel</p>
            <p>✅ Complete Hostel Management App</p>
            <p>✅ Tenant Verification support</p>
            <p className="mt-2"><strong>With our app, you can:</strong></p>
            <p>• Manage rent & payments easily</p>
            <p>• Store tenant records digitally</p>
            <p>• Send automatic reminders ⏰</p>
            <p>• Handle check-in/check-out smoothly</p>
            <p>• Access everything from your phone</p>
            <p className="mt-2"><strong>🛡️ Security Benefits:</strong></p>
            <p>• Verified tenant records</p>
            <p>• Reduced fraud risks</p>
            <p>• Easy police verification support</p>
            <p>• Complete tenant history</p>
            <p className="mt-2">This helps you:</p>
            <p>✔️ Increase occupancy</p>
            <p>✔️ Run your Hostel professionally</p>
            <p>✔️ Save time & improve security</p>
            <p className="mt-2">We are onboarding only limited Hostels in your area</p>
            <p className="mt-2 font-medium">Would you like a quick demo?</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
