# Bài thực hành 5 — Chat 1-1 realtime với Firebase (thiết kế)

- Sinh viên: B23DCCC054
- Ngày: 2026-10-28
- Project: `E:\project\B23DCCC054_APPDNT_TH05` (React Native CLI 0.88.1, TypeScript)

## 1. Mục tiêu

Ứng dụng chat 1-1 viết lại từ đầu (không dùng code Bài 4). Hai người dùng đăng ký/đăng nhập bằng Firebase Auth (Email/Password), thấy nhau trong Danh bạ với trạng thái online thời gian thực, nhắn tin văn bản và gửi vị trí, tin hiện ngay không cần tải lại. Home liệt kê cuộc trò chuyện kèm số tin chưa đọc.

**Tiêu chí thành công:** đáp ứng đủ mục 1–7 của đề; quay được video 2 thiết bị chat với nhau, tin hiện ngay.

**Ngoài phạm vi:** gửi ảnh, chat nhóm, push notification, sửa/xóa tin, đổi ảnh đại diện.

## 2. Ràng buộc kỹ thuật

- React Native CLI (không Expo), React Navigation.
- Firebase JS SDK: `firebase/auth`, `firebase/database`. Toàn bộ code Firebase nằm trong `src/services/`.
- `@react-native-community/geolocation` để lấy vị trí.
- Mọi listener (`onValue`, `onChildAdded`, `onAuthStateChanged`) phải hủy trong cleanup của `useEffect`.
- Màn Thông báo giữ dạng Bài 4: danh sách thông báo mẫu tĩnh.
- Thư viện được duyệt: `firebase`, `@react-native-community/geolocation`, `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `react-native-screens`, `react-native-safe-area-context`, `@react-native-async-storage/async-storage`, `react-native-vector-icons`. Muốn thêm thư viện khác phải hỏi trước.
- Môi trường: Windows, npm. Máy ảo Pixel_7_API_36 gần đầy bộ nhớ, nên cài APK với `-PreactNativeArchitectures=x86_64`.

## 3. Mô hình dữ liệu (Realtime Database)

```
users/{uid}
  name: string
  email: string
  online: boolean
  lastSeen: number          // serverTimestamp

messages/{chatId}/{msgId}
  senderId: string
  type: "text" | "location"
  text?: string             // khi type = text
  lat?: number              // khi type = location
  lng?: number
  createdAt: number         // serverTimestamp

userChats/{uid}/{otherUid}
  lastMessage: string       // văn bản, hoặc "📍 Vị trí" với tin vị trí
  lastTime: number
  unread: number
```

- `chatId = [uidA, uidB].sort().join('_')`.
- Tên và ảnh đại diện trên Home lấy từ `users/{otherUid}` (đã lắng nghe ở danh bạ), không lưu lặp trong `userChats`.

## 4. Luật bảo mật

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      "$uid": { ".write": "auth != null && auth.uid === $uid" }
    },
    "messages": {
      "$chatId": {
        ".read": "auth != null && $chatId.contains(auth.uid)",
        ".indexOn": ["createdAt"],
        "$msgId": {
          ".write": "auth != null && $chatId.contains(auth.uid) && !data.exists() && newData.child('senderId').val() === auth.uid",
          ".validate": "newData.hasChildren(['senderId','type','createdAt'])"
        }
      }
    },
    "userChats": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        "$otherUid": { ".write": "auth != null && (auth.uid === $uid || auth.uid === $otherUid)" }
      }
    }
  }
}
```

## 5. Cấu trúc mã nguồn

```
App.tsx                       // bọc AuthProvider + NavigationContainer
src/
  services/
    firebase.ts               // initializeApp, initializeAuth (AsyncStorage persistence), getDatabase
    authService.ts            // register, login, logout, mapAuthError
    userService.ts            // subscribeUsers, startPresence, setOffline
    chatService.ts            // sendText, sendLocation, subscribeMessages, subscribeUserChats, markAsRead
    locationService.ts        // requestPermission, getCurrentPosition
  context/AuthContext.tsx     // user hiện tại từ onAuthStateChanged; bật presence khi đăng nhập
  navigation/
    RootNavigator.tsx         // chưa đăng nhập → AuthStack; đã đăng nhập → AppStack
    AuthStack.tsx             // Login, Register
    AppStack.tsx              // MainTabs + Chat
    MainTabs.tsx              // Home, Contacts, Notifications, Settings
  screens/                    // Login, Register, Home, Contacts, Chat, Notifications, Settings
  components/                 // Avatar, OnlineDot, MessageBubble, LocationBubble, ChatInput, ConversationItem, UserItem
  data/notifications.ts       // dữ liệu mẫu cho màn Thông báo
  utils/                      // chatId.ts, formatTime.ts, validation.ts, avatarColor.ts
  theme/                      // màu, khoảng cách, cỡ chữ
```

Màn hình chỉ gọi các hàm trong `services`, không import trực tiếp `firebase/*`. Hàm `subscribe*` nhận callback và trả về hàm hủy để dùng thẳng trong cleanup của `useEffect`.

## 6. Luồng chức năng

### 6.1 Đăng ký / Đăng nhập / Đăng xuất
- **Register:** gồm họ tên, email, mật khẩu, nhập lại mật khẩu. `validation.ts` kiểm tra tên không rỗng, email đúng định dạng, mật khẩu ≥ 6 ký tự, nhập lại khớp; lỗi hiện dưới từng ô. Hợp lệ thì gọi `createUserWithEmailAndPassword`, `updateProfile({displayName})`, rồi ghi `users/{uid}`.
- **Login:** gọi `signInWithEmailAndPassword`. `mapAuthError` đổi mã lỗi sang tiếng Việt (`auth/invalid-credential`, `auth/invalid-email`, `auth/too-many-requests`, `auth/network-request-failed`, `auth/email-already-in-use`).
- **Logout** (màn Cài đặt): `setOffline(uid)` rồi `signOut`. `RootNavigator` tự chuyển về AuthStack.
- Đăng nhập được giữ qua `getReactNativePersistence(AsyncStorage)`.

### 6.2 Trạng thái online
- Khi có user, `startPresence(uid)` lắng nghe `.info/connected`. Mỗi lần kết nối: đăng ký `onDisconnect(users/{uid}).update({online:false, lastSeen:serverTimestamp()})`, sau đó ghi `online:true`. Hàm trả về hàm hủy.
- Danh bạ và tiêu đề Chat đọc `online` qua `subscribeUsers`. Offline thì hiện "Hoạt động lúc HH:mm" dựa trên `lastSeen`.

### 6.3 Danh bạ
- `subscribeUsers` → `onValue(users)`, loại bỏ uid của mình, sắp theo tên. Ô tìm kiếm lọc theo tên hoặc email, không phân biệt hoa thường. Nhấn vào một người thì mở Chat với `{otherUid}`.

### 6.4 Chat 1-1
- Tiêu đề: tên người kia và chấm/nhãn online.
- `subscribeMessages(chatId)` → `onChildAdded(query(orderByChild('createdAt')))`, thêm tin vào state; cleanup hủy listener để không lặp tin.
- Bong bóng: tin của mình nằm bên phải và có màu nhấn, tin người kia nằm bên trái và có màu trung tính; mỗi tin có giờ `HH:mm`.
- Gửi: nút gửi bị vô hiệu khi `text.trim()` rỗng. `sendText` gọi một `update(ref(db), {...})` ghi tin mới (`push` key), `userChats/{me}/{other}` (`unread: 0`) và `userChats/{other}/{me}` (`unread: increment(1)`).
- Tự cuộn: `FlatList` gọi `scrollToEnd` khi nội dung đổi kích thước.
- Đã đọc: gọi `markAsRead` khi mở màn và mỗi khi có tin mới trong lúc màn đang mở.

### 6.5 Gửi vị trí
- Nút 📍 cạnh ô nhập. `requestPermission` dùng `PermissionsAndroid.request(ACCESS_FINE_LOCATION)`; bị từ chối thì hiện Alert "Bạn đã từ chối quyền truy cập vị trí". Được phép thì `getCurrentPosition` (timeout 15 s; lỗi thì hiện Alert) rồi `sendLocation(lat, lng)`.
- `LocationBubble` có icon bản đồ, chữ "Vị trí hiện tại" và tọa độ rút gọn. Nhấn vào thì `Linking.openURL('https://www.google.com/maps/search/?api=1&query=lat,lng')`.
- Khai báo `ACCESS_FINE_LOCATION` và `ACCESS_COARSE_LOCATION` trong `AndroidManifest.xml`.

### 6.6 Home
- `subscribeUserChats(uid)` → `onValue(userChats/{uid})`, sắp theo `lastTime` giảm dần, ghép với danh sách users để lấy tên, avatar và online.
- Mỗi dòng có avatar, tên, tin cuối, thời gian (hôm nay thì `HH:mm`, ngày khác thì `dd/MM`) và badge chưa đọc nếu `unread > 0`. Danh sách rỗng thì gợi ý sang Danh bạ.
- Tab Home hiện `tabBarBadge` bằng tổng số chưa đọc.

### 6.7 Thông báo & Cài đặt
- Thông báo: FlatList dữ liệu mẫu tĩnh (icon, tiêu đề, nội dung, thời gian).
- Cài đặt: avatar, tên, email của tài khoản; nút Đăng xuất có hộp xác nhận.

## 7. Xử lý lỗi
- Lỗi Auth hiện bằng chữ tiếng Việt trên form; lỗi mạng hoặc ghi dữ liệu hiện bằng Alert.
- Nút bị vô hiệu và hiện spinner trong lúc gọi Firebase để không gửi lặp.
- Lỗi quyền hoặc timeout vị trí hiện Alert, app không crash.

## 8. Kiểm thử
- Jest cho `utils`: `chatId` (đối xứng), `formatTime`, `validation`, `mapAuthError`.
- Kiểm thử tay trên máy ảo: đăng ký 2 tài khoản rồi chat qua lại, kiểm tra online/offline, số chưa đọc, tin vị trí và quyền bị từ chối.
- Phần nộp bài để cuối: dọn bộ nhớ hoặc tạo máy ảo thứ hai, chạy 2 máy cùng lúc, chụp các ảnh màn hình theo đề, chụp Firebase Console (tab Data) và quay video 1–2 phút.

## 9. Việc người dùng làm trên Firebase Console
1. Tạo project Firebase và thêm Web app để lấy `firebaseConfig`.
2. Bật Authentication với Email/Password.
3. Tạo Realtime Database (chọn region asia-southeast1), dán luật ở mục 4.
4. Gửi `firebaseConfig` (gồm cả `databaseURL`) để điền vào `src/services/firebase.ts`.

## 10. Rủi ro
- Firebase JS SDK trên Metro (RN 0.88): `firebase/auth` cần được resolve đúng bản react-native, `getReactNativePersistence` mới có mặt. Sẽ kiểm tra ngay khi cài; nếu lỗi thì chỉnh `metro.config.js` (`resolver.unstable_conditionNames`).
- Bộ nhớ máy ảo hạn chế: chỉ build x86_64; máy thứ hai xử lý ở bước cuối.
