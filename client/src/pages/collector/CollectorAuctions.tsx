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
          setLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Location error:", error);
          setLocationError("Unable to get your location");
          // Fallback to Mathugama, Kalutara, Sri Lanka
          setLocation([6.5309, 80.1553]);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      setLocationError("Geolocation not supported");
      setLocation([6.5309, 80.1553]); // Mathugama coordinates
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
