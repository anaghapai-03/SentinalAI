import React from "react";

function MapView() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Map View Component</h2>
      <p>This component can be customized for map visualization</p>
    </div>
  );
}

export default MapView;
      const features = {
        time: new Date().getHours(),
        day: new Date().getDay(),
        crowd: Math.random(),
        lighting: Math.random(),
        incidents: Math.floor(Math.random() * 20),
      };

      const risk = await getRisk(features);

      const deviated = isDeviated(current, route);

      if (deviated && risk === 1) {
        alert("⚠️ High Risk! Route deviation detected.");
      }

      console.log("Risk:", risk);
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ height: "100vh" }} />;
}

export default MapView;