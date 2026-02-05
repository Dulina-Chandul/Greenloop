import { useEffect, useState } from "react";
import LiveMarketMap from "@/components/map/LiveMarketMap";
import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";
import { Loader2 } from "lucide-react";

export default function CollectorAuctions() {
  const user = useAppSelector(selectUser);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // FIXED: Correct order [lat, lng] for Leaflet
          setLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Location error:", error);
          setLocationError("Unable to get your location");
          // Fallback to Colombo [lat, lng]
          setLocation([6.9271, 79.8612]);
        },
      );
    } else {
      setLocationError("Geolocation not supported");
      setLocation([6.9271, 79.8612]);
    }
  }, []);

  if (!location) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-400">Getting your location...</p>
          {locationError && (
            <p className="text-red-500 text-sm mt-2">{locationError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <LiveMarketMap collectorLocation={location} collectorId={user?._id || ""} />
  );
}
