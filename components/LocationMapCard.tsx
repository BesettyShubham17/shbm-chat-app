"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for react-leaflet components since they don't work with SSR
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

import L from "leaflet";
import { MapPin } from "lucide-react";

interface LocationMapCardProps {
  lat: number;
  lng: number;
  isLive?: boolean;
}

export default function LocationMapCard({ lat, lng, isLive }: LocationMapCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Fix leaflet marker icon issue in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[200px] bg-black/40 animate-pulse rounded-xl flex items-center justify-center"><MapPin className="text-gray-500 animate-bounce" size={32} /></div>;

  return (
    <div className="w-[300px] sm:w-[400px] max-w-full h-[200px] relative rounded-xl overflow-hidden border border-white/10 group cursor-pointer">
      <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 0 }} attributionControl={false}>
        {/* Dark Theme Map Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <div className="text-gray-800 font-semibold">{isLive ? "Live Location" : "Shared Location"}</div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Overlay controls */}
      <div className="absolute bottom-2 right-2 z-[400] flex gap-2">
         {isLive && (
           <div className="bg-red-500/20 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-red-400 border border-red-500/30 flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> Live
           </div>
         )}
         <button className="bg-surface/80 backdrop-blur-md p-1.5 rounded-md text-white hover:bg-primary transition-colors shadow-lg pointer-events-auto" onClick={(e) => { e.stopPropagation(); window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank"); }}>
           <MapPin size={16} />
         </button>
      </div>
      
      {/* Transparent overlay to catch clicks and prevent map interaction from taking over scroll too easily */}
      <div className="absolute inset-0 z-[300] bg-transparent" onDoubleClick={() => window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank")}></div>
    </div>
  );
}
