export const getCurrentLocation = () => new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by your browser'));
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
        }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
});
