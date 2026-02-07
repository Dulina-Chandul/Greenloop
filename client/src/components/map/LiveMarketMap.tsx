import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { io, Socket } from "socket.io-client";
import { Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/config/api/axiosInstance";
import { Input } from "@/components/ui/input";

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Simple professional listing marker
const createListingIcon = (isUrgent: boolean = false) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="position: relative; width: 30px; height: 30px;">
        <div style="
          width: 30px;
          height: 30px;
          background: ${isUrgent ? "#ef4444" : "#10b981"};
          border: 2px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Collector vehicle marker
const createCollectorIcon = () => {
  return L.divIcon({
    className: "collector-marker",
    html: `
      <div style="position: relative; width: 40px; height: 40px;">
        <div style="
          width: 40px;
          height: 40px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

interface Listing {
  _id: string;
  title: string;
  finalWeight: number;
  finalValue: number;
  primaryImage: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat] from MongoDB
  };
  address: {
    city: string;
    district: string;
  };
  category: string;
  isUrgent?: boolean;
  sellerId: {
    _id: string;
    firstName: string;
    lastName: string;
    rating: { average: number };
  };
  currentHighestBid?: number;
  biddingDeadline?: string;
  totalBids?: number;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

interface LiveMarketMapProps {
  collectorLocation: [number, number]; // [lat, lng] for Leaflet
  collectorId: string;
}

export default function LiveMarketMap({
  collectorLocation,
  collectorId,
}: LiveMarketMapProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchAllListings = async () => {
    try {
      // Fetch ALL listings without radius restriction
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/listings/all`,
        { credentials: "include" },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched all listings:", data);
      setListings(data.data?.listings || data.listings || []);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllListings();

    // Socket.io setup (optional for now)
    try {
      // Connect to the root URL, not the API URL
      const socketUrl = import.meta.env.VITE_API_URL.replace(
        /\/api\/v1\/?$/,
        "",
      );
      socketRef.current = io(socketUrl, {
        withCredentials: true,
      });

      socketRef.current.emit("collector:join", {
        collectorId,
        location: collectorLocation,
      });

      socketRef.current.on("listing:new", (data) => {
        console.log("New listing:", data.listing);
        setListings((prev) => [data.listing, ...prev]);
      });

      socketRef.current.on("listing:updated", (data) => {
        setListings((prev) =>
          prev.map((listing) =>
            listing._id === data.listingId
              ? { ...listing, ...data.updates }
              : listing,
          ),
        );
      });
      socketRef.current.on("seller:location_update", (data) => {
        console.log("Seller moved:", data);
        setListings((prev) =>
          prev.map((listing) => {
            // Check if this listing belongs to the moving seller
            if (listing.sellerId._id === data.sellerId) {
              return {
                ...listing,
                location: {
                  ...listing.location,
                  coordinates: [data.location.lng, data.location.lat], // GeoJSON [lng, lat]
                },
              };
            }
            return listing;
          }),
        );
      });
    } catch (error) {
      console.error("Socket connection error:", error);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [collectorId, collectorLocation]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Map Section */}
      <div className="flex-1 relative">
        <MapContainer
          center={collectorLocation}
          zoom={13}
          className="h-full w-full"
          zoomControl={true}
        >
          <MapController center={collectorLocation} />

          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Collector's location with vehicle icon */}
          <Marker position={collectorLocation} icon={createCollectorIcon()}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-blue-600 mb-1">
                  📍 Your Location
                </div>
                <div className="text-xs text-gray-600">
                  Lat: {collectorLocation[0].toFixed(6)}
                </div>
                <div className="text-xs text-gray-600">
                  Lng: {collectorLocation[1].toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Removed radius restriction - showing all listings */}

          {/* Listing markers */}
          {listings.map((listing) => {
            // Convert MongoDB coords [lng, lat] to Leaflet [lat, lng]
            const [lng, lat] = listing.location.coordinates;
            return (
              <Marker
                key={listing._id}
                position={[lat, lng]}
                icon={createListingIcon(listing.isUrgent)}
                eventHandlers={{
                  click: () => setSelectedListing(listing),
                }}
              >
                <Popup autoPan={false}>
                  <div className="w-56">
                    <img
                      src={listing.primaryImage}
                      alt={listing.title}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <h3 className="font-semibold text-base mb-1">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {listing.address.city}, {listing.address.district}
                    </p>
                    <div className="flex gap-2 mb-2">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        ⚖️ {listing.finalWeight} kg
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        💰 Rs. {listing.finalValue}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Category:{" "}
                      <span className="font-medium">{listing.category}</span>
                    </div>
                    {listing.currentHighestBid && (
                      <div className="text-xs text-orange-600 font-medium">
                        🔥 Current Bid: Rs. {listing.currentHighestBid}
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedListing(listing)}
                      className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 rounded"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Search Bar Overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
          <div className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search location..."
              className="px-4 py-2 w-64 outline-none text-sm"
            />
            <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Nearby Jobs */}
      <div className="w-80 lg:w-96 bg-gray-800 p-4 overflow-y-auto hidden md:block">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            All Available Listings
          </h2>
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {listings.length} Active
          </span>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          All scrap collection opportunities across the platform.
        </p>

        <div className="space-y-3">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className="bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => setSelectedListing(listing)}
            >
              <img
                src={listing.primaryImage}
                alt={listing.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold text-white mb-1">
                  {listing.title}
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  {listing.address.city}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    {listing.finalWeight} kg Est.
                  </span>
                  {listing.isUrgent && (
                    <span className="text-pink-400 text-sm flex items-center gap-1">
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
                      High Priority
                    </span>
                  )}
                </div>

                <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                  Place Bid
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Job List (Bottom Sheet) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 rounded-t-2xl max-h-[40vh] overflow-y-auto z-[1000]">
        <div className="p-4">
          <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4"></div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">All Listings</h2>
            <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
              {listings.length}
            </span>
          </div>
          <div className="space-y-2">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="flex gap-3 bg-gray-700 p-3 rounded-lg"
                onClick={() => setSelectedListing(listing)}
              >
                <img
                  src={listing.primaryImage}
                  alt={listing.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">
                    {listing.title}
                  </h3>
                  <p className="text-gray-400 text-xs">
                    {listing.address.city}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-green-400">
                      {listing.finalWeight} kg
                    </span>
                    <span className="text-xs text-white font-semibold">
                      Rs. {listing.finalValue}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listing Details Modal */}
      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}

function ListingDetailsModal({
  listing,
  onClose,
}: {
  listing: Listing;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [editBidAmount, setEditBidAmount] = useState<number>(0);
  const [existingBid, setExistingBid] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Add query to check existing bid
  const { data: myBidData } = useQuery({
    queryKey: ["my-bid", listing._id],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/bids/my-bids`);
        const bids = response.data.bids;
        const foundBid = bids.find(
          (b: any) => b.listingId._id === listing._id && b.status === "pending",
        );
        // Return null instead of undefined if no bid found
        return foundBid || null;
      } catch (error) {
        console.error("Error fetching my bids:", error);
        return null;
      }
    },
  });

  useEffect(() => {
    if (myBidData) {
      setExistingBid(myBidData);
      setEditBidAmount(myBidData.amount);
    } else {
      setEditBidAmount((listing.currentHighestBid || 0) + 0.5);
    }
  }, [myBidData, listing]);

  // Countdown timer effect
  useEffect(() => {
    const calculateTimeLeft = () => {
      // Assuming listing has a biddingDeadline, if not, we can't show a countdown
      // The interface shows isUrgent, but we need an actual date.
      // Let's assume listing object has a deadline or we use a mock one if missing for now?
      // actually the interface Listing doesn't have biddingDeadline. Let's add it to interface or check backend.
      // listing.model.ts has biddingDeadline. Listing interface in this file needs it.
      // Casting listing to any to access biddingDeadline for now to avoid TS error if I can't change interface easily here.
      const deadline = listing.biddingDeadline;
      if (!deadline) {
        setTimeLeft("No Deadline");
        return;
      }

      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [listing]);

  const handleQuickBid = (increment: number) => {
    setEditBidAmount((prev) => parseFloat((prev + increment).toFixed(2)));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{listing.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-red-400 font-mono font-bold animate-pulse">
                  {timeLeft}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 text-sm">Bidding ends soon</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <img
            src={listing.primaryImage}
            alt={listing.title}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-700 rounded">
              <div className="text-xs text-gray-400">Material</div>
              <div className="font-semibold text-white">{listing.category}</div>
            </div>
            <div className="text-center p-3 bg-gray-700 rounded">
              <div className="text-xs text-gray-400">Weight</div>
              <div className="font-semibold text-white">
                {listing.finalWeight} kg
              </div>
            </div>
            <div className="text-center p-3 bg-gray-700 rounded">
              <div className="text-xs text-gray-400">Est. Value</div>
              <div className="font-semibold text-white">
                ${listing.finalValue}
              </div>
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-700 rounded-lg flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-400 mb-1">
                Current Highest Bid
              </div>
              <div className="text-3xl font-bold text-white">
                Rs. {(listing.currentHighestBid || 0).toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Total Bidders</div>
              <div className="text-xl font-bold text-white">
                {listing.totalBids || 0}
              </div>
            </div>
          </div>

          <div className="mb-4">
            {existingBid ? (
              <div className="mb-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                <p className="text-blue-400 text-sm mb-2">Your current bid</p>
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-white">
                    ${existingBid.amount.toFixed(2)}
                  </p>
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs uppercase">
                    {existingBid.status}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <label className="text-sm text-gray-400">Place your bid</label>
              <Input
                type="number"
                value={editBidAmount}
                onChange={(e) => setEditBidAmount(parseFloat(e.target.value))}
                placeholder="Enter your bid"
                step="0.1"
                min={(listing.currentHighestBid || 0) + 0.1}
                className="bg-gray-700 border-green-600 border-2 text-white text-xl h-14 text-center"
              />

              <div className="flex gap-2 justify-center">
                {[0.5, 1.0, 2.0].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => handleQuickBid(inc)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-green-400 border border-green-500/30 rounded-full text-sm transition-colors"
                  >
                    +${inc.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            onClick={() => {
              onClose();
              navigate(`/collector/auctions/${listing._id}`, {
                state: { initialBid: editBidAmount },
              });
            }}
          >
            {existingBid ? "Manage Bid Details ➝" : "Proceed to Bid ➝"}
          </button>
        </div>
      </div>
    </div>
  );
}
