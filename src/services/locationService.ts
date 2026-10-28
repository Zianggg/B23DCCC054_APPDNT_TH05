import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return new Promise(resolve =>
      Geolocation.requestAuthorization(
        () => resolve(true),
        () => resolve(false),
      ),
    );
  }
  // Android 12+ cho chọn "Vị trí gần đúng" (chỉ COARSE), vẫn tính là được phép
  const { ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION } = PermissionsAndroid.PERMISSIONS;
  const result = await PermissionsAndroid.requestMultiple([ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION]);
  return [ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION].some(
    p => result[p] === PermissionsAndroid.RESULTS.GRANTED,
  );
}

export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) =>
    Geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    ),
  );
}
