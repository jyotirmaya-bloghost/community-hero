import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const severityColor = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#ca8a04",
  Low: "#16a34a",
};

function severityIcon(severity) {
  const color = severityColor[severity] || "#6b7280";
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      width:16px;height:16px;
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 0 0 1px ${color};
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function MapView({ issues = [], center = [22.3149, 87.3105], zoom = 13 }) {
  return (
    <div className="w-full h-[420px] rounded-xl overflow-hidden border border-gray-200">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.location.lat, issue.location.lng]}
            icon={severityIcon(issue.aiSeverity)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{issue.aiCategory || issue.category}</p>
                <p className="text-gray-500">{issue.description}</p>
                {issue.aiSeverity && (
                  <p className="mt-1">
                    Severity: <span className="font-medium">{issue.aiSeverity}</span>
                  </p>
                )}
                {issue.status && (
                  <p className="text-xs text-gray-400 mt-1 capitalize">Status: {issue.status}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}