export function isDeviated(current, route) {
  return !route.some(point => {
    const dist = Math.sqrt(
      Math.pow(current.lat - point.lat, 2) +
      Math.pow(current.lng - point.lng, 2)
    );
    return dist < 0.001;
  });
}