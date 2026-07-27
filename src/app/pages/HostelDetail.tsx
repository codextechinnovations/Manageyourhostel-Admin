import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Flame,
  Camera,
  Users,
  Star,
  Home,
  Wifi,
  Wind,
  Car,
  UtensilsCrossed,
  WashingMachine,
  Zap,
  Wrench,
  Bed,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Badge } from "../../components/Modal";
import { adminService } from "../../services/adminService";
import { toast } from "sonner";

interface HostelDetail {
  _id: string;
  ownerId: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  salesPersonId?: {
    _id: string;
    name: string;
  };
  name: string;
  type: "male" | "female" | "colive";
  totalRooms: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  qrCode?: string;
  logo?: string;
  area?: string;
  price?: number;
  longTermRent?: {
    single?: number;
    double?: number;
    triple?: number;
  };
  shortTermRent?: {
    single?: number;
    double?: number;
    triple?: number;
  };
  rentalType?: "long_term" | "short_term" | "both";
  rating?: number;
  reviews?: number;
  images?: { url: string; category?: string }[];
  videos?: string[];
  isVerified: boolean;
  isAvailable: boolean;
  phone?: string;
  description?: string;
  fireSafety?: boolean;
  cctv?: boolean;
  policeVerification?: boolean;
  lastInspection?: string;
  isActive?: boolean;
  tenantCount?: number;
  status: "active" | "inactive" | "deleted";
  checkin_url?: string;
  autoRentReminder?: boolean;
  autoReminderTime?: string;
  createdAt: string;
  updatedAt: string;
  rooms?: Room[];
  tenants?: Tenant[];
}

interface Room {
  _id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  occupied: number;
  rent: number;
  status: string;
}

interface Tenant {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  roomId?: { roomNumber: string };
  bed_number?: number;
  monthlyRent: number;
  status: "active" | "inactive" | "moved_out";
  joining_date: string;
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  laundry: WashingMachine,
  washing_machine: WashingMachine,
  generator: Zap,
  food: UtensilsCrossed,
  lift: Building2,
  parking: Car,
  online_maintenance: Wrench,
  ac: Wind,
};

const amenityLabels: Record<string, string> = {
  wifi: "WiFi",
  laundry: "Laundry",
  washing_machine: "Washing Machine",
  generator: "Generator",
  food: "Food",
  lift: "Lift",
  parking: "Parking",
  online_maintenance: "Online Maintenance",
  ac: "AC",
};

export function HostelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState<HostelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "rooms" | "safety">("overview");

  useEffect(() => {
    fetchHostel();
  }, [id]);

  const fetchHostel = async () => {
    try {
      setLoading(true);
      const response = await adminService.getHostelById(id!);
      if (response.success) {
        setHostel(response.data);
      } else {
        toast.error(response.message || "Failed to fetch hostel details");
      }
    } catch (err) {
      console.error("Error fetching hostel:", err);
      toast.error("Failed to fetch hostel details");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (isVerified: boolean) => {
    if (!hostel) return;
    setActionLoading(true);
    try {
      await adminService.verifyHostel(hostel._id, { isVerified });
      toast.success(isVerified ? "Hostel verified successfully" : "Hostel unverified");
      fetchHostel();
    } catch (err) {
      console.error("Error verifying hostel:", err);
      toast.error("Failed to update verification status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!hostel) return;
    if (!window.confirm("Are you sure you want to delete this hostel? This action cannot be undone.")) return;
    setActionLoading(true);
    try {
      await adminService.deleteHostel(hostel._id);
      toast.success("Hostel deleted successfully");
      navigate("/hostel-management");
    } catch (err) {
      console.error("Error deleting hostel:", err);
      toast.error("Failed to delete hostel");
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrls = (): string[] => {
    if (!hostel?.images || hostel.images.length === 0) return [];
    return hostel.images.map((img) => img.url).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Hostel Not Found</h2>
        <button
          onClick={() => navigate("/hostel-management")}
          className="mt-4 text-primary hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const imageUrls = getImageUrls();

  return (
    <div>
      <button
        onClick={() => navigate("/hostel-management")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Hostel Management
      </button>

      <PageHeader
        title={hostel.name}
        description={`${hostel.type === "colive" ? "Co-Live" : hostel.type.charAt(0).toUpperCase() + hostel.type.slice(1)} Hostel • ${hostel.city}, ${hostel.state}`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVerify(!hostel.isVerified)}
              disabled={actionLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                hostel.isVerified
                  ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              <Shield className="w-4 h-4" />
              {hostel.isVerified ? "Unverify" : "Verify"}
            </button>
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Delete
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Home className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Overview</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{hostel.type}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bed className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Rooms</p>
                  <p className="font-medium">{hostel.totalRooms}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tenants</p>
                  <p className="font-medium">{hostel.tenantCount || 0}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium">
                    {hostel.rating || 0} ({hostel.reviews || 0} reviews)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={hostel.isAvailable ? "success" : "danger"}>
                    {hostel.isAvailable ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <Badge variant={hostel.isVerified ? "success" : "warning"}>
                    {hostel.isVerified ? "Yes" : "Pending"}
                  </Badge>
                </div>
              </div>
            </div>

            {hostel.description && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{hostel.description}</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Location & Contact</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{hostel.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {hostel.city}, {hostel.state} - {hostel.pincode}
                  </p>
                  {hostel.area && (
                    <p className="text-sm text-muted-foreground mt-1">Area: {hostel.area}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{hostel.phone || "Not provided"}</p>
                </div>
              </div>

              {(hostel.latitude || hostel.longitude) && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Coordinates</p>
                    <p className="font-medium text-sm">
                      Lat: {hostel.latitude}, Lng: {hostel.longitude}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Wifi className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Amenities</h2>
            </div>

            {hostel.amenities && hostel.amenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hostel.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || CheckCircle;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="text-sm">{amenityLabels[amenity] || amenity}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No amenities listed</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Camera className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Gallery</h2>
            </div>

            {imageUrls.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {imageUrls.slice(0, 8).map((url, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setSelectedImages(imageUrls);
                      setCurrentImageIndex(index);
                    }}
                  >
                    <img src={url} alt={`Hostel ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No images uploaded</p>
            )}

            {hostel.videos && hostel.videos.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium mb-2">Videos ({hostel.videos.length})</p>
                <div className="flex gap-2 overflow-x-auto">
                  {hostel.videos.map((video, index) => (
                    <a
                      key={index}
                      href={video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
                    >
                      Video {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bed className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Rooms ({hostel.rooms?.length || 0})</h2>
              </div>
            </div>

            {hostel.rooms && hostel.rooms.length > 0 ? (
              <div className="space-y-3">
                {hostel.rooms.map((room) => (
                  <div
                    key={room._id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bed className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Room {room.roomNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Floor {room.floor} • {room.occupied}/{room.capacity} occupied
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">₹{room.rent?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">/month</p>
                      </div>
                      <Badge
                        variant={
                          room.status === "available"
                            ? "success"
                            : room.status === "full"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {room.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No rooms added yet</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Tenants ({hostel.tenants?.length || 0})</h2>
              </div>
            </div>

            {hostel.tenants && hostel.tenants.length > 0 ? (
              <div className="space-y-3">
                {hostel.tenants.map((tenant) => (
                  <div
                    key={tenant._id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {tenant.phone}
                          {tenant.roomId?.roomNumber && ` • Room ${tenant.roomId.roomNumber}`}
                          {tenant.bed_number && ` • Bed ${tenant.bed_number}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">₹{tenant.monthlyRent?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">/month</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            tenant.status === "active"
                              ? "success"
                              : tenant.status === "inactive"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {tenant.status === "active"
                            ? "Active"
                            : tenant.status === "inactive"
                            ? "Inactive"
                            : "Moved Out"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {new Date(tenant.joining_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tenants found</p>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Owner Details</h2>

            {hostel.ownerId ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{hostel.ownerId.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{hostel.ownerId.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{hostel.ownerId.email || "Not provided"}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/hostel-owner-verification/${hostel.ownerId._id}`)}
                  className="w-full mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                >
                  View Owner Profile
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No owner assigned</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Pricing</h2>

            <div className="space-y-4">
              {(hostel.rentalType === "long_term" || hostel.rentalType === "both") && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Long Term Rent (Monthly)</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                      <span className="text-sm">Single</span>
                      <span className="font-medium">₹{hostel.longTermRent?.single?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                      <span className="text-sm">Double</span>
                      <span className="font-medium">₹{hostel.longTermRent?.double?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                      <span className="text-sm">Triple</span>
                      <span className="font-medium">₹{hostel.longTermRent?.triple?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {(hostel.rentalType === "short_term" || hostel.rentalType === "both") && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Short Term Rent (Daily)</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                      <span className="text-sm">Single</span>
                      <span className="font-medium">₹{hostel.shortTermRent?.single?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                      <span className="text-sm">Double</span>
                      <span className="font-medium">₹{hostel.shortTermRent?.double?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                      <span className="text-sm">Triple</span>
                      <span className="font-medium">₹{hostel.shortTermRent?.triple?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {!hostel.rentalType && (
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm">Base Price</span>
                  <span className="font-medium">₹{hostel.price?.toLocaleString() || 0}</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Safety & Compliance</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm">Fire Safety</span>
                </div>
                <Badge variant={hostel.fireSafety ? "success" : "danger"}>
                  {hostel.fireSafety ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">CCTV</span>
                </div>
                <Badge variant={hostel.cctv ? "success" : "danger"}>
                  {hostel.cctv ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Police Verification</span>
                </div>
                <Badge variant={hostel.policeVerification ? "success" : "danger"}>
                  {hostel.policeVerification ? "Yes" : "No"}
                </Badge>
              </div>

              {hostel.lastInspection && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <span className="text-sm">Last Inspection</span>
                  </div>
                  <span className="text-sm font-medium">
                    {new Date(hostel.lastInspection).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card/50 backdrop-blur-xl rounded-xl border border-border p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Additional Info</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {new Date(hostel.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">
                  {new Date(hostel.updatedAt).toLocaleDateString()}
                </span>
              </div>

              {hostel.checkin_url && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Check-in URL</p>
                  <a
                    href={hostel.checkin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {hostel.checkin_url}
                  </a>
                </div>
              )}

              {hostel.autoRentReminder && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Auto Rent Reminder</span>
                  <Badge variant="success">Enabled ({hostel.autoReminderTime})</Badge>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {selectedImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setSelectedImages([])}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            onClick={() => setSelectedImages([])}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <button
            className="absolute left-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(
                (currentImageIndex - 1 + selectedImages.length) % selectedImages.length
              );
            }}
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          <img
            src={selectedImages[currentImageIndex]}
            alt={`Image ${currentImageIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex((currentImageIndex + 1) % selectedImages.length);
            }}
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
            <p className="text-white text-sm">
              {currentImageIndex + 1} / {selectedImages.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
