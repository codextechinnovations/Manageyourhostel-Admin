import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Plus, MapPin, Users, CheckCircle, Clock, Eye, Trash2, Shield, Home, Building2, Edit2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { Modal, FormField, Badge } from '../../components/Modal';
import { adminService } from '../../services/adminService';
import { Hostel } from '../../types/api';

export function HostelManagement() {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [owners, setOwners] = useState<{_id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);
  const [ownerFilter, setOwnerFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [newHostel, setNewHostel] = useState({
    name: '', type: 'male', ownerId: '', address: '', city: '', state: '', pincode: '',
    totalRooms: 0, longTermRent: 0, shortTermRent: 0, amenities: [] as string[], description: ''
  });

  useEffect(() => {
    fetchHostels();
    fetchOwners();
  }, []);

  useEffect(() => {
    fetchHostels();
  }, [ownerFilter]);

  const fetchOwners = async () => {
    try {
      const response = await adminService.getHostels({ limit: 100 });
      if (response.success) {
        const ownersMap = new Map<string, { _id: string; name: string }>();
        response.data.forEach((hostel: any) => {
          if (hostel.ownerId?._id && hostel.ownerId?.name && !ownersMap.has(hostel.ownerId._id)) {
            ownersMap.set(hostel.ownerId._id, { _id: hostel.ownerId._id, name: hostel.ownerId.name });
          }
        });
        setOwners(Array.from(ownersMap.values()));
      }
    } catch (err) {
      console.error('Error fetching owners:', err);
    }
  };

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const response = await adminService.getHostels({ limit: 100, ownerId: ownerFilter || undefined });
      if (response.success) {
        setHostels(response.data);
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

  const handleViewDetails = (hostel: Hostel) => {
    navigate(`/hostel-management/${hostel._id}`);
  };

  const handleVerify = async (hostelId: string, isVerified: boolean) => {
    try {
      await adminService.verifyHostel(hostelId, { isVerified });
      fetchHostels();
    } catch (err) {
      console.error('Error verifying Hostel:', err);
    }
  };

  const handleDelete = async (hostelId: string) => {
    if (!confirm('Are you sure you want to delete this Hostel?')) return;
    try {
      setDeleteError(null);
      const response = await adminService.deleteHostel(hostelId);
      if (response.success) {
        fetchHostels();
      } else {
        setDeleteError(response.message || 'Failed to delete Hostel');
      }
    } catch (err: any) {
      console.error('Error deleting Hostel:', err);
      setDeleteError(err.response?.data?.message || err.message || 'Failed to delete Hostel. Please try again.');
    }
  };

  const handleAddHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminService.createHostel(newHostel);
      if (response.success) {
        setShowAddModal(false);
        setNewHostel({ name: '', type: 'male', ownerId: '', address: '', city: '', state: '', pincode: '', totalRooms: 0, longTermRent: 0, shortTermRent: 0, amenities: [], description: '' });
        fetchHostels();
        fetchOwners();
      }
    } catch (err) {
      console.error('Error adding Hostel:', err);
    }
  };

  const handleEditHostel = (hostel: Hostel) => {
    setEditingHostel(hostel);
    setShowEditModal(true);
  };

  const handleUpdateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHostel) return;
    try {
      const response = await adminService.updateHostel(editingHostel._id, editingHostel);
      if (response.success) {
        setShowEditModal(false);
        setEditingHostel(null);
        fetchHostels();
      }
    } catch (err) {
      console.error('Error updating Hostel:', err);
    }
  };

  const columns = [
    { key: 'name', label: 'Hostel Name', sortable: true },
    { 
      key: 'ownerId', 
      label: 'Owner', 
      render: (v: any) => v?.name || '-' 
    },
    { key: 'type', label: 'Type', sortable: true, render: (v: string) => <Badge variant="info">{v}</Badge> },
    {
      key: 'location',
      label: 'Location',
      render: (_: any, row: Hostel) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{row.city || '-'}, {row.state || '-'}</span>
        </div>
      )
    },
    { key: 'totalRooms', label: 'Rooms', sortable: true, render: (v: number) => <span>{v || 0}</span> },
    
    {
      key: 'isVerified',
      label: 'Verified',
      render: (v: boolean) => v ? <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Yes</Badge> : <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => v === 'active' ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Hostel) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleViewDetails(row)} className="p-2 hover:bg-accent rounded-lg transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => handleEditHostel(row)} className="p-2 hover:bg-accent rounded-lg transition-colors text-blue-500" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleVerify(row._id, !row.isVerified)} className="p-2 hover:bg-accent rounded-lg transition-colors" title={row.isVerified ? 'Unverify' : 'Verify'}>
            <Shield className={`w-4 h-4 ${row.isVerified ? 'text-green-500' : 'text-yellow-500'}`} />
          </button>
          {row.status !== 'deleted' && (
            <button onClick={() => handleDelete(row._id)} className="p-2 hover:bg-accent rounded-lg transition-colors text-red-500" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const activeHostels = hostels.filter(hostel => hostel.isAvailable);
  const verifiedHostels = hostels.filter(hostel => hostel.isVerified);
  const totalRooms = hostels.reduce((sum, hostel) => sum + (hostel.totalRooms || 0), 0);

   return (
    <div>
      {deleteError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex justify-between items-center">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}
      <PageHeader
        title="Hostel Management"
        description="Manage all Hostels on the platform. Assign owners and verify listings."
        action={
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" />
            Add New Hostel
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hostels</p>
              <p className="text-2xl font-semibold">{hostels.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold text-green-500">{activeHostels.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              <p className="text-2xl font-semibold text-yellow-500">{verifiedHostels.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Rooms</p>
              <p className="text-2xl font-semibold">{totalRooms}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Filter by Owner:</label>
            <select
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
            >
              <option value="">All Owners</option>
              {owners.map(owner => (
                <option key={owner._id} value={owner._id}>{owner.name}</option>
              ))}
            </select>
          </div>
          {ownerFilter && (
            <button onClick={() => setOwnerFilter('')} className="text-sm text-primary hover:underline">
              Clear filter
            </button>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <DataTable columns={columns} data={hostels} loading={loading} />
      </motion.div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Hostel" size="lg">
        <form onSubmit={handleAddHostel}>
          <div className="space-y-4">
            <FormField label="Select Owner *" required>
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newHostel.ownerId}
                onChange={(e) => setNewHostel({ ...newHostel, ownerId: e.target.value })}
                required
              >
                <option value="">Select Owner</option>
                {owners.map(owner => (
                  <option key={owner._id} value={owner._id}>{owner.name}</option>
                ))}
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Hostel Name *">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newHostel.name}
                  onChange={(e) => setNewHostel({ ...newHostel, name: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Type *">
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newHostel.type}
                  onChange={(e) => setNewHostel({ ...newHostel, type: e.target.value })}
                >
                  <option value="male">Male Hostel</option>
                  <option value="female">Female Hostel</option>
                  <option value="colive">Co-Live</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="City *">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newHostel.city}
                  onChange={(e) => setNewHostel({ ...newHostel, city: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="State">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newHostel.state}
                  onChange={(e) => setNewHostel({ ...newHostel, state: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Address">
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newHostel.address}
                onChange={(e) => setNewHostel({ ...newHostel, address: e.target.value })}
                rows={2}
              />
            </FormField>

            <FormField label="Total Rooms">
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                value={newHostel.totalRooms}
                onChange={(e) => setNewHostel({ ...newHostel, totalRooms: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Long Term Rent (₹/month)">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newHostel.longTermRent}
                  onChange={(e) => setNewHostel({ ...newHostel, longTermRent: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </FormField>
              <FormField label="Short Term Rent (₹/day)">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={newHostel.shortTermRent}
                  onChange={(e) => setNewHostel({ ...newHostel, shortTermRent: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </FormField>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg">
              Add Hostel
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Hostel" size="lg">
        {editingHostel && (
          <form onSubmit={handleUpdateHostel}>
            <div className="space-y-4">
              <FormField label="Select Owner *" required>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={typeof editingHostel.ownerId === 'string' ? editingHostel.ownerId : editingHostel.ownerId?._id || ''}
                  onChange={(e) => setEditingHostel({ ...editingHostel, ownerId: e.target.value })}
                  required
                >
                  <option value="">Select Owner</option>
                  {owners.map(owner => (
                    <option key={owner._id} value={owner._id}>{owner.name}</option>
                  ))}
                </select>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Hostel Name *">
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={editingHostel.name}
                    onChange={(e) => setEditingHostel({ ...editingHostel, name: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label="Type *">
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={editingHostel.type}
                    onChange={(e) => setEditingHostel({ ...editingHostel, type: e.target.value as 'male' | 'female' | 'colive' })}
                  >
                    <option value="male">Male Hostel</option>
                    <option value="female">Female Hostel</option>
                    <option value="colive">Co-Live</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="City *">
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={editingHostel.city}
                    onChange={(e) => setEditingHostel({ ...editingHostel, city: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label="State">
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={editingHostel.state}
                    onChange={(e) => setEditingHostel({ ...editingHostel, state: e.target.value })}
                  />
                </FormField>
              </div>

              <FormField label="Address">
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={editingHostel.address}
                  onChange={(e) => setEditingHostel({ ...editingHostel, address: e.target.value })}
                  rows={2}
                />
              </FormField>

              <FormField label="Total Rooms">
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  value={editingHostel.totalRooms}
                  onChange={(e) => setEditingHostel({ ...editingHostel, totalRooms: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Long Term Rent (₹/month)">
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={editingHostel.longTermRent || 0}
                    onChange={(e) => setEditingHostel({ ...editingHostel, longTermRent: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </FormField>
                <FormField label="Short Term Rent (₹/day)">
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    value={editingHostel.shortTermRent || 0}
                    onChange={(e) => setEditingHostel({ ...editingHostel, shortTermRent: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </FormField>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#2d2d7e] to-[#1e3a8a] text-white rounded-lg">
                Update Hostel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
