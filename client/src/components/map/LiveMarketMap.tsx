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

// Custom blinking marker
const createBlinkingIcon = (isUrgent: boolean = false) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="absolute inset-0 ${isUrgent ? "animate-ping" : "animate-pulse"} bg-green-500 rounded-full opacity-75 w-8 h-8"></div>
        <div class="relative bg-green-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
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
    firstName: string;
    lastName: string;
    rating: { average: number };
  };
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

  const fetchNearbyListings = async () => {
    try {
      const [lat, lng] = collectorLocation;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/listings/nearby?longitude=${lng}&latitude=${lat}&radius=10`,
        { credentials: "include" },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched listings:", data);
      setListings(data.data.listings || []);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyListings();

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

          {/* Collector's location */}
          <Marker position={collectorLocation}>
            <Popup>
              <div className="text-sm font-medium">Your Location</div>
            </Popup>
          </Marker>

          {/* Service radius */}
          <Circle
            center={collectorLocation}
            radius={10000}
            pathOptions={{
              color: "green",
              fillColor: "green",
              fillOpacity: 0.1,
            }}
          />

          {/* Listing markers */}
          {listings.map((listing) => {
            // Convert MongoDB coords [lng, lat] to Leaflet [lat, lng]
            const [lng, lat] = listing.location.coordinates;
            return (
              <Marker
                key={listing._id}
                position={[lat, lng]}
                icon={createBlinkingIcon(listing.isUrgent)}
                eventHandlers={{
                  click: () => setSelectedListing(listing),
                }}
              >
                <Popup>
                  <div className="w-48">
                    <img
                      src={listing.primaryImage}
                      alt={listing.title}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <h3 className="font-semibold text-sm">{listing.title}</h3>
                    <p className="text-xs text-gray-600">
                      {listing.address.city}
                    </p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        {listing.finalWeight} kg
                      </span>
                      <span className="font-semibold">
                        Rs. {listing.finalValue}
                      </span>
                    </div>
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
          <h2 className="text-xl font-bold text-white">Nearby Jobs</h2>
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {listings.length} Active
          </span>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Scrap collection opportunities near you.
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
            <h2 className="text-lg font-bold text-white">Nearby Jobs</h2>
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-white">{listing.title}</h2>
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
              <div className="font-semibold text-white">Mixed Iron</div>
            </div>
            <div className="text-center p-3 bg-gray-700 rounded">
              <div className="text-xs text-gray-400">Weight</div>
              <div className="font-semibold text-white">
                {listing.finalWeight} kg
              </div>
            </div>
            <div className="text-center p-3 bg-gray-700 rounded">
              <div className="text-xs text-gray-400">Distance</div>
              <div className="font-semibold text-white">2.5 km</div>
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">
              Current Highest Bid
            </div>
            <div className="text-4xl font-bold text-white">
              Rs. {listing.finalValue}
            </div>
            <div className="text-sm text-gray-400 mt-1">+2 active bidders</div>
          </div>

          <div className="mb-4">
            <input
              type="number"
              placeholder="Enter your bid amount"
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-2 border-green-600 focus:outline-none"
            />
          </div>

          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Place Bid Now 🔨
          </button>
        </div>
      </div>
    </div>
  );
}
