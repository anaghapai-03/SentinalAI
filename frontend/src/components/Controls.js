import React from "react";

function Controls() {

  const shareLocation = (lat, lon) => {
    const msg = `I may be unsafe. Track me: https://maps.google.com/?q=${lat},${lon}`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ position: "absolute", zIndex: 1, padding: 10 }}>
      <button onClick={() => shareLocation(12.97, 77.59)}>
        Share Location
      </button>
    </div>
  );
}

export default Controls;