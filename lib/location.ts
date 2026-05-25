"use client";

/**
 * Simple wrapper around the Geolocation API.
 * Provides functions to request permission, get the current position,
 * and start watching the position for live updates.
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (!navigator.geolocation) return false;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false)
    );
  });
};

export const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
  if (!navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => resolve(null)
    );
  });
};

export const watchLocation = (
  onLocation: (lat: number, lng: number) => void,
  onError?: (error: GeolocationPositionError) => void
): (() => void) => {
  if (!navigator.geolocation) {
    onError && onError({ code: 0, message: "Geolocation not supported", PERMISSION_DENIED: 0, POSITION_UNAVAILABLE: 0, TIMEOUT: 0 } as any);
    return () => {};
  }
  const watchId = navigator.geolocation.watchPosition(
    (pos) => onLocation(pos.coords.latitude, pos.coords.longitude),
    (err) => onError && onError(err),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  );
  return () => navigator.geolocation.clearWatch(watchId);
};
