import React from "react";

function BangaloreSidebar({ setActiveView }) {
  const bangaloreAreas = [
    { name: "Indiranagar", icon: "🏢", coords: { lat: 13.0012, lng: 77.6426 }, desc: "IT Hub" },
    { name: "Whitefield", icon: "💼", coords: { lat: 12.9698, lng: 77.7049 }, desc: "Tech Valley" },
    { name: "MG Road", icon: "🛍️", coords: { lat: 12.9749, lng: 77.6101 }, desc: "Shopping & Business" },
    { name: "Koramangala", icon: "🍽️", coords: { lat: 12.9352, lng: 77.6245 }, desc: "Food & Entertainment" },
    { name: "JPNagar", icon: "🏘️", coords: { lat: 12.9352, lng: 77.5872 }, desc: "Residential" },
    { name: "BTM Layout", icon: "🏗️", coords: { lat: 12.9168, lng: 77.6101 }, desc: "Business District" },
    { name: "Marathahalli", icon: "🏬", coords: { lat: 12.9698, lng: 77.7499 }, desc: "Shopping & Offices" },
    { name: "HSR Layout", icon: "🏘️", coords: { lat: 12.9352, lng: 77.6201 }, desc: "Residential & Cafes" },
    { name: "Richmond Town", icon: "🎭", coords: { lat: 12.9749, lng: 77.5945 }, desc: "Heritage Area" },
    { name: "Jayanagar", icon: "🌳", coords: { lat: 12.9502, lng: 77.5945 }, desc: "Parks & Restaurants" },
    { name: "Banashankari", icon: "🏛️", coords: { lat: 12.9168, lng: 77.5945 }, desc: "Temple Area" },
    { name: "Ramamurthy Nagar", icon: "📍", coords: { lat: 13.0169, lng: 77.6426 }, desc: "Metro Connected" },
  ];

  return (
    <div style={{
      width: "280px",
      background: "#1a202c",
      borderRight: "1px solid #2d3748",
      padding: "1.5rem",
      height: "calc(100vh - 76px)",
      overflowY: "auto",
      position: "fixed",
      left: 0,
      top: "76px",
      zIndex: 999
    }}>
      <h3 style={{
        fontSize: "1.2rem",
        marginBottom: "1.5rem",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid #2d3748"
      }}>
        📍 BANGALORE AREAS
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {bangaloreAreas.map((area, idx) => (
          <div
            key={idx}
            onClick={() => {
              // This could trigger route calculation to this area
              setActiveView && setActiveView("safe-routes");
            }}
            style={{
              padding: "1rem",
              background: "#2d3748",
              borderRadius: "8px",
              cursor: "pointer",
              border: "1px solid #4a5568",
              transition: "all 0.2s ease",
              hover: {
                background: "#3b82f6",
                borderColor: "#3b82f6"
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#3b82f6";
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2d3748";
              e.currentTarget.style.borderColor = "#4a5568";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.5rem"
            }}>
              <span style={{ fontSize: "1.5rem" }}>{area.icon}</span>
              <div>
                <div style={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#fff"
                }}>
                  {area.name}
                </div>
                <div style={{
                  fontSize: "0.75rem",
                  color: "#cbd5e1"
                }}>
                  {area.desc}
                </div>
              </div>
            </div>
            
            <div style={{
              fontSize: "0.7rem",
              color: "#a0aec0",
              paddingLeft: "2.5rem"
            }}>
              📌 {area.coords.lat.toFixed(4)}°, {area.coords.lng.toFixed(4)}°
            </div>
          </div>
        ))}
      </div>

      {/* Safety Tips Section */}
      <div style={{
        marginTop: "2rem",
        padding: "1rem",
        background: "#2d3748",
        borderRadius: "8px",
        borderLeft: "3px solid #f59e0b"
      }}>
        <h4 style={{ fontSize: "0.9rem", marginBottom: "0.75rem", color: "#fbbf24" }}>
          🛡️ SAFETY TIPS
        </h4>
        <ul style={{
          fontSize: "0.8rem",
          color: "#cbd5e1",
          paddingLeft: "1.5rem",
          lineHeight: "1.6"
        }}>
          <li>Stick to well-lit areas</li>
          <li>Move in groups when possible</li>
          <li>Check real-time threat map</li>
          <li>Share location with guardians</li>
          <li>Use safest rated routes</li>
        </ul>
      </div>

      {/* Emergency Contact */}
      <div style={{
        marginTop: "1.5rem",
        padding: "1rem",
        background: "#7f1d1d",
        borderRadius: "8px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>🚔 EMERGENCY</div>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#fca5a5" }}>
          100 / +91-1234567890
        </div>
      </div>
    </div>
  );
}

export default BangaloreSidebar;
