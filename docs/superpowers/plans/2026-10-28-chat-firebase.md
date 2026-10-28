# Chat 1-1 realtime với Firebase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ứng dụng RN CLI chat 1-1 realtime: đăng ký/đăng nhập Firebase, danh bạ có online, chat văn bản và vị trí, Home có số tin chưa đọc.

**Architecture:** Màn hình (`src/screens`) chỉ gọi hàm trong `src/services`. Hàm `subscribe*` nhận callback và trả về hàm hủy để dùng trong cleanup của `useEffect`. `AuthContext` giữ user hiện tại và bật presence. `RootNavigator` chọn AuthStack hoặc AppStack theo user.

**Tech Stack:** React Native 0.88.1 (TypeScript), React Navigation 7 (native-stack, bottom-tabs), Firebase JS SDK (auth, database), @react-native-community/geolocation, AsyncStorage, react-native-vector-icons 10.3.0 (MaterialCommunityIcons), Jest.

**Spec:** `docs/superpowers/specs/2026-10-28-chat-firebase-design.md`

## Global Constraints

- RN CLI, không Expo. Toàn bộ import `firebase/*` chỉ nằm trong `src/services/`.
- Mọi listener (`onValue`, `onChildAdded`, `onAuthStateChanged`, `.info/connected`) hủy trong cleanup của `useEffect`.
- Chỉ dùng các thư viện ở mục 2 của spec; muốn thêm thư viện khác phải hỏi người dùng.
- Toàn bộ chữ trên UI bằng tiếng Việt.
- Đường dẫn DB: `users/{uid}`, `messages/{chatId}/{msgId}`, `userChats/{uid}/{otherUid}`; `chatId = [a,b].sort().join('_')`.
- Cài app lên máy ảo bằng `cd android && .\gradlew.bat app:installDebug -PreactNativeArchitectures=x86_64`.
- Project không dùng git: bỏ các bước commit, thay bằng chạy `npx tsc --noEmit` và `npm test` khi xong mỗi task.

## Review Focus

1. **Mở/đóng màn Chat nhiều lần**: tin nhắn không được hiện lặp (listener hủy đúng). Task 6 có test cho hàm hủy.
2. **Tin mới đến lúc đang mở Chat**: `unread` phải về 0, badge Home không tăng. Task 6 gọi `markAsRead` mỗi khi danh sách tin đổi.
3. **Đăng xuất rồi đăng nhập tài khoản khác trên cùng máy**: người cũ chuyển offline, danh bạ và Home không còn dữ liệu của người cũ. Task 4 đặt offline trước `signOut`; listener phụ thuộc `uid`.
4. **Input có khoảng trắng** (tên chỉ có dấu cách, email có dấu cách thừa, tin chỉ có dấu cách): phải trim. Test ở Task 2 và Task 6.
5. **Nhấn gửi hai lần, hoặc mất mạng**: không gửi trùng tin; hiện Alert khi lỗi. Task 6 khóa nút gửi lúc đang gửi.

---

### Task 1: Thư viện, theme và khung điều hướng

**Files:**
- Modify: `package.json`, `android/app/build.gradle`, `android/app/src/main/AndroidManifest.xml`, `jest.config.js`, `App.tsx`, `__tests__/App.test.tsx`
- Create: `src/theme/index.ts`, `src/navigation/{RootNavigator,AuthStack,AppStack,MainTabs}.tsx`, `src/navigation/types.ts`, các màn tạm `src/screens/{Login,Register,Home,Contacts,Chat,Notifications,Settings}Screen.tsx`

**Interfaces:**
- Produces: `AuthStackParamList = { Login: undefined; Register: undefined }`, `AppStackParamList = { MainTabs: undefined; Chat: { otherUid: string } }`, `MainTabParamList = { Home; Contacts; Notifications; Settings }` (đều `undefined`). `theme` export `colors`, `spacing`, `radius`, `font`.

- [ ] **Step 1:** `npm i firebase @react-native-community/geolocation @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage react-native-vector-icons@10.3.0` và `npm i -D @types/react-native-vector-icons`.
- [ ] **Step 2:** Thêm `apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")` vào `android/app/build.gradle`. Thêm `ACCESS_FINE_LOCATION` và `ACCESS_COARSE_LOCATION` vào manifest.
- [ ] **Step 3:** Trong `jest.config.js`: `transformIgnorePatterns` cho phép `@react-native|react-native|@react-navigation|react-native-vector-icons|firebase|@firebase`; mock AsyncStorage bằng `moduleNameMapper` như bài giữa kỳ. Xóa test App mặc định, thay bằng test `utils` ở Task 2.
- [ ] **Step 4:** Dựng navigation. `RootNavigator` tạm thời luôn hiện `AuthStack`. `MainTabs` dùng icon MaterialCommunityIcons `chat`, `account-multiple`, `bell`, `cog` với nhãn "Tin nhắn", "Danh bạ", "Thông báo", "Cài đặt". Màn tạm chỉ hiện tiêu đề.
- [ ] **Step 5: Verify:** chạy `npx tsc --noEmit` không lỗi; `npm start` cùng lệnh cài x86_64 → app mở được màn Login tạm.

### Task 2: Utils thuần (TDD)

**Files:**
- Create: `src/utils/{chatId,formatTime,validation,avatarColor}.ts`
- Test: `__tests__/utils.test.ts`

**Interfaces:**
- Produces:
  - `getChatId(a: string, b: string): string`
  - `formatMessageTime(ts?: number): string` → `HH:mm`; `''` nếu không có `ts`
  - `formatListTime(ts: number | undefined, now?: number): string` → hôm nay thì `HH:mm`, ngày khác thì `dd/MM`, `''` nếu không có `ts`
  - `formatLastSeen(ts?: number): string` → `"Hoạt động lúc HH:mm"` (khác ngày: `"Hoạt động ngày dd/MM"`); `''` nếu không có `ts`
  - `validateRegister(v: {name; email; password; confirm}): Partial<Record<'name'|'email'|'password'|'confirm', string>>`
  - `validateLogin(v: {email; password}): Partial<Record<'email'|'password', string>>`
  - `getAvatarColor(uid: string): string` (chọn ổn định từ bảng 8 màu); `getInitials(name: string): string` (tối đa 2 chữ cái, viết hoa)

- [ ] **Step 1: Viết test fail**

```ts
expect(getChatId('b','a')).toBe('a_b');
expect(getChatId('a','b')).toBe(getChatId('b','a'));
expect(formatMessageTime(undefined)).toBe('');
expect(formatMessageTime(new Date(2026,9,28,9,5).getTime())).toBe('09:05');
expect(formatListTime(new Date(2026,9,27,9,5).getTime(), new Date(2026,9,28,10,0).getTime())).toBe('27/10');
expect(validateRegister({name:'  ', email:'a@b.com', password:'123456', confirm:'123456'}).name).toBe('Vui lòng nhập họ tên');
expect(validateRegister({name:'An', email:'abc', password:'123456', confirm:'123456'}).email).toBe('Email không hợp lệ');
expect(validateRegister({name:'An', email:'a@b.com', password:'12345', confirm:'12345'}).password).toBe('Mật khẩu tối thiểu 6 ký tự');
expect(validateRegister({name:'An', email:'a@b.com', password:'123456', confirm:'1234567'}).confirm).toBe('Mật khẩu nhập lại không khớp');
expect(validateRegister({name:'An', email:' a@b.com ', password:'123456', confirm:'123456'})).toEqual({});
expect(getInitials('nguyễn văn an')).toBe('NA');
expect(getAvatarColor('uid1')).toBe(getAvatarColor('uid1'));
```

- [ ] **Step 2:** Chạy `npm test` → FAIL vì module chưa tồn tại.
- [ ] **Step 3:** Cài đặt các hàm. Trim tên và email trước khi kiểm tra; regex email `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. `getInitials` lấy chữ đầu của từ đầu và từ cuối.
- [ ] **Step 4:** Chạy `npm test` → PASS.

### Task 3: Kết nối Firebase và authService

**Cần trước:** `firebaseConfig` của người dùng, có cả `databaseURL`. Nếu chưa có thì dừng và hỏi.

**Files:**
- Create: `src/services/firebase.ts`, `src/services/authService.ts`
- Modify: `metro.config.js` (chỉ khi lỗi resolve)
- Test: `__tests__/authService.test.ts` (chỉ test `mapAuthError`; mock `../src/services/firebase`)

**Interfaces:**
- Produces:
  - `auth: Auth`, `db: Database` export từ `firebase.ts` (dùng `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })`)
  - `register(name: string, email: string, password: string): Promise<void>`: tạo user, `updateProfile`, `set(users/{uid}, {name, email, online: true, lastSeen: serverTimestamp()})`
  - `login(email: string, password: string): Promise<void>`
  - `logout(uid: string): Promise<void>`: ghi `update(users/{uid}, {online:false, lastSeen: serverTimestamp()})` rồi `signOut`. Task 5 thay bước ghi này bằng `setOffline(uid)`.
  - `subscribeAuth(cb: (user: User | null) => void): () => void`
  - `mapAuthError(code: string): string`

- [ ] **Step 1: Viết test fail**

```ts
expect(mapAuthError('auth/invalid-credential')).toBe('Email hoặc mật khẩu không đúng');
expect(mapAuthError('auth/wrong-password')).toBe('Email hoặc mật khẩu không đúng');
expect(mapAuthError('auth/user-not-found')).toBe('Email hoặc mật khẩu không đúng');
expect(mapAuthError('auth/email-already-in-use')).toBe('Email đã được sử dụng');
expect(mapAuthError('auth/invalid-email')).toBe('Email không hợp lệ');
expect(mapAuthError('auth/too-many-requests')).toBe('Thử lại quá nhiều lần, vui lòng đợi');
expect(mapAuthError('auth/network-request-failed')).toBe('Không có kết nối mạng');
expect(mapAuthError('xyz')).toBe('Đã có lỗi xảy ra, vui lòng thử lại');
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Cài đặt `firebase.ts` và `authService.ts`. Email được trim trước khi gọi Firebase.
- [ ] **Step 4:** `npm test` → PASS. Chạy `npm start -- --reset-cache`, mở app và xem Metro log: không có lỗi `getReactNativePersistence is not a function` hoặc cảnh báo "Auth state will not persist". Nếu có, thêm vào `metro.config.js` `resolver.unstable_conditionNames = ['react-native','require','default']` rồi kiểm tra lại.

### Task 4: AuthContext, Đăng nhập, Đăng ký, Đăng xuất

**Files:**
- Create: `src/context/AuthContext.tsx`, `src/components/{TextField,PrimaryButton}.tsx`
- Modify: `App.tsx`, `src/navigation/RootNavigator.tsx`, `src/screens/{Login,Register,Settings}Screen.tsx`

**Interfaces:**
- Consumes: `subscribeAuth`, `register`, `login`, `logout`, `mapAuthError` (Task 3); `validateRegister`, `validateLogin` (Task 2).
- Produces: `useAuth(): { user: User | null; initializing: boolean }`. `TextField` có props `label, value, onChangeText, error?, secureTextEntry?, keyboardType?, autoCapitalize?`. `PrimaryButton` có props `title, onPress, loading?, disabled?`.

- [ ] **Step 1:** `AuthProvider` lắng nghe `subscribeAuth` trong `useEffect` (return hàm hủy). Trong lúc `initializing` thì `RootNavigator` hiện spinner; có `user` thì hiện `AppStack`, ngược lại hiện `AuthStack`.
- [ ] **Step 2:** `LoginScreen` gồm email, mật khẩu, nút "Đăng nhập", link "Chưa có tài khoản? Đăng ký". Lỗi validate hiện dưới ô. Lỗi Firebase hiện ở một dòng đỏ phía trên nút (`mapAuthError(e.code)`). Nút loading và disabled trong lúc gọi.
- [ ] **Step 3:** `RegisterScreen` gồm họ tên, email, mật khẩu, nhập lại mật khẩu, nút "Đăng ký". Thành công thì app tự vào AppStack nhờ `onAuthStateChanged`.
- [ ] **Step 4:** `SettingsScreen` hiện avatar (Task 5 thay bằng component `Avatar`; tạm hiện chữ cái đầu), tên, email, nút "Đăng xuất". Nút mở `Alert` "Bạn có chắc muốn đăng xuất?" với hai lựa chọn Hủy và Đăng xuất, chọn Đăng xuất thì gọi `logout(uid)`.
- [ ] **Step 5: Verify trên máy ảo:** (a) đăng ký tài khoản A thì vào được tab. (b) Firebase Console có `users/{uidA}`. (c) Đăng xuất thì về Login. (d) Đăng nhập sai mật khẩu thì hiện "Email hoặc mật khẩu không đúng". (e) Tắt rồi mở lại app vẫn đăng nhập.

### Task 5: Presence và Danh bạ

**Files:**
- Create: `src/services/userService.ts`, `src/components/{Avatar,OnlineDot,UserItem,SearchBar}.tsx`
- Modify: `src/context/AuthContext.tsx`, `src/services/authService.ts`, `src/screens/{Contacts,Settings}Screen.tsx`
- Test: `__tests__/userService.test.ts`

**Interfaces:**
- Produces:
  - `type AppUser = { uid: string; name: string; email: string; online: boolean; lastSeen?: number }`
  - `subscribeUsers(cb: (users: AppUser[]) => void): () => void`: trả về **mọi** user, sắp theo tên (`localeCompare` với `'vi'`)
  - `filterContacts(users: AppUser[], myUid: string, query: string): AppUser[]`: loại bản thân, lọc theo tên hoặc email, không phân biệt hoa thường, query được trim
  - `startPresence(uid: string): () => void`
  - `setOffline(uid: string): Promise<void>`
  - `Avatar` có props `{ uid: string; name: string; size?: number; online?: boolean }`; khi có `online` thì hiện `OnlineDot` ở góc
- Consumes: `getAvatarColor`, `getInitials`, `formatLastSeen` (Task 2)

- [ ] **Step 1: Viết test fail** cho `filterContacts`

```ts
const us = [{uid:'me',name:'Tôi',email:'me@x.com',online:true},{uid:'u1',name:'Bình',email:'binh@x.com',online:false},{uid:'u2',name:'An',email:'an@y.com',online:true}];
expect(filterContacts(us,'me','').map(u=>u.uid)).toEqual(['u1','u2']);
expect(filterContacts(us,'me','  BÌNH ').map(u=>u.uid)).toEqual(['u1']);
expect(filterContacts(us,'me','y.com').map(u=>u.uid)).toEqual(['u2']);
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Cài đặt `userService`. `startPresence`: `onValue(ref(db,'.info/connected'))`; khi `true` thì `onDisconnect(users/{uid}).update({online:false,lastSeen:serverTimestamp()})`, sau đó `update(users/{uid},{online:true})`. Trả về hàm hủy listener. `AuthContext` gọi `startPresence(user.uid)` trong effect phụ thuộc `user?.uid`. `logout` gọi `setOffline` trước `signOut`; `setOffline` cũng gọi `onDisconnect(...).cancel()`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** `ContactsScreen` có `SearchBar` và `FlatList` các `UserItem` (avatar có chấm online, tên, dòng phụ "Đang hoạt động" hoặc `formatLastSeen`). Nhấn vào một người thì `navigation.navigate('Chat', { otherUid })`. Danh sách rỗng thì hiện "Không tìm thấy người dùng". Thay avatar ở Settings bằng `Avatar`.
- [ ] **Step 6: Verify:** đăng ký thêm tài khoản B. Đăng nhập A thì thấy B ở trạng thái offline. Sửa `users/{uidB}/online` thành `true` trên Console thì chấm đổi màu ngay không cần tải lại.

### Task 6: chatService và màn Chat (tin văn bản)

**Files:**
- Create: `src/services/chatService.ts`, `src/components/{MessageBubble,ChatInput,ChatHeader}.tsx`
- Modify: `src/screens/ChatScreen.tsx`, `src/navigation/AppStack.tsx`
- Test: `__tests__/chatService.test.ts` (mock `firebase/database` và `../src/services/firebase`)

**Interfaces:**
- Produces:
  - `type Message = { id: string; senderId: string; type: 'text' | 'location'; text?: string; lat?: number; lng?: number; createdAt?: number }`
  - `sendText(myUid: string, otherUid: string, text: string): Promise<void>`: throw `Error('EMPTY')` nếu `text.trim()` rỗng
  - `sendLocation(myUid: string, otherUid: string, lat: number, lng: number): Promise<void>` (Task 7 dùng)
  - `subscribeMessages(chatId: string, cb: (msg: Message) => void): () => void`
  - `markAsRead(myUid: string, otherUid: string): Promise<void>`: chỉ cập nhật `userChats/{me}/{other}/unread = 0` khi node đã tồn tại (dùng `update` tới path `unread`)
  - `type UserChat = { otherUid: string; lastMessage: string; lastTime: number; unread: number }`
  - `subscribeUserChats(uid: string, cb: (chats: UserChat[]) => void): () => void`: sắp `lastTime` giảm dần (Task 8 dùng)
- Consumes: `getChatId`, `formatMessageTime` (Task 2); `subscribeUsers`, `Avatar` (Task 5)

- [ ] **Step 1: Viết test fail**

```ts
await expect(sendText('a','b','   ')).rejects.toThrow('EMPTY');
// update được gọi 1 lần với 3 path:
await sendText('a','b',' hi ');
const updates = (update as jest.Mock).mock.calls[0][1];
expect(Object.keys(updates).sort()).toEqual(['messages/a_b/K','userChats/a/b','userChats/b/a']);
expect(updates['messages/a_b/K']).toMatchObject({senderId:'a',type:'text',text:'hi'});
expect(updates['userChats/a/b']).toMatchObject({lastMessage:'hi',unread:0});
expect(updates['userChats/b/a'].unread).toEqual(increment(1));
// hàm hủy của subscribeMessages gọi đúng unsubscribe do onChildAdded trả về
const unsub = jest.fn(); (onChildAdded as jest.Mock).mockReturnValue(unsub);
subscribeMessages('a_b', jest.fn())(); expect(unsub).toHaveBeenCalled();
```
(`push` mock trả `{ key: 'K' }`; `increment`/`serverTimestamp` mock trả giá trị đánh dấu.)

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Cài đặt `chatService`. `userChats/{x}/{y}` được ghi cả object `{lastMessage,lastTime: serverTimestamp(),unread}`, trong đó `unread` của người nhận là `increment(1)`. Tin vị trí dùng `lastMessage = '📍 Vị trí'`. `subscribeMessages` dùng `onChildAdded(query(ref(db,'messages/'+chatId), orderByChild('createdAt')))`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** `ChatScreen`:
  - Thanh tiêu đề tùy biến (`ChatHeader`): nút back, `Avatar` có online, tên, dòng phụ "Đang hoạt động" hoặc `formatLastSeen`.
  - Một effect phụ thuộc `chatId` reset `messages = []`, `return subscribeMessages(chatId, m => setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]))`.
  - Một effect phụ thuộc `messages.length` gọi `markAsRead`.
  - `MessageBubble` căn phải cho tin của mình, căn trái cho người kia, có giờ `formatMessageTime`.
  - `FlatList` có `onContentSizeChange={() => listRef.current?.scrollToEnd({animated:true})}`.
  - Bọc bằng `KeyboardAvoidingView`.
  - `ChatInput`: nút gửi disabled khi `text.trim()===''` hoặc đang gửi. Khi gửi thì xóa ô ngay; lỗi thì khôi phục text và `Alert.alert('Lỗi', 'Không gửi được tin nhắn')`.
  - Ẩn header mặc định của Stack cho màn Chat.
- [ ] **Step 6: Verify:** A gửi cho B. Đăng nhập B thì thấy tin bên trái. Gửi lại thì tin hiện ngay. Back rồi vào lại màn Chat 3 lần, số tin không bị nhân đôi. Console có `messages/{chatId}`.

### Task 7: Gửi vị trí

**Files:**
- Create: `src/services/locationService.ts`, `src/components/LocationBubble.tsx`, `src/utils/mapsUrl.ts`
- Modify: `src/components/ChatInput.tsx`, `src/components/MessageBubble.tsx`, `src/screens/ChatScreen.tsx`
- Test: `__tests__/utils.test.ts` (thêm)

**Interfaces:**
- Produces:
  - `getMapsUrl(lat: number, lng: number): string`
  - `requestLocationPermission(): Promise<boolean>`
  - `getCurrentPosition(): Promise<{ lat: number; lng: number }>` (timeout 15000, `enableHighAccuracy: true`)
- Consumes: `sendLocation` (Task 6)

- [ ] **Step 1: Viết test fail:** `expect(getMapsUrl(21.0285, 105.8542)).toBe('https://www.google.com/maps/search/?api=1&query=21.0285,105.8542')`.
- [ ] **Step 2:** `npm test` → FAIL. Cài đặt rồi chạy lại → PASS.
- [ ] **Step 3:** `locationService` dùng `PermissionsAndroid.request(ACCESS_FINE_LOCATION)` và `Geolocation.getCurrentPosition`.
- [ ] **Step 4:** `ChatInput` có nút "📍" bên trái ô nhập, hiện spinner trong lúc lấy vị trí. Bị từ chối quyền thì `Alert.alert('Không có quyền vị trí', 'Bạn đã từ chối quyền truy cập vị trí. Hãy bật lại trong Cài đặt để gửi vị trí.')`. Lỗi hoặc timeout thì `Alert.alert('Lỗi', 'Không lấy được vị trí hiện tại')`.
- [ ] **Step 5:** `MessageBubble` hiện `LocationBubble` khi `type === 'location'`: icon `map-marker`, chữ "Vị trí hiện tại", tọa độ 4 chữ số thập phân, dòng "Nhấn để mở Google Maps", nền khác tin thường. Nhấn vào thì `Linking.openURL(getMapsUrl(...))`.
- [ ] **Step 6: Verify:** đặt vị trí giả cho máy ảo bằng `adb emu geo fix 105.8542 21.0285`. Gửi vị trí thì thấy bong bóng; nhấn vào mở Google Maps (hoặc trình duyệt) đúng tọa độ. Thu hồi quyền bằng `adb shell pm revoke com.b23dcccc054_appdnt_th05 android.permission.ACCESS_FINE_LOCATION` (lấy đúng package trong `android/app/build.gradle`), nhấn 📍, chọn Từ chối thì hiện Alert.

### Task 8: Home — cuộc trò chuyện và số chưa đọc

**Files:**
- Create: `src/components/ConversationItem.tsx`, `src/context/ChatsContext.tsx`
- Modify: `src/screens/HomeScreen.tsx`, `src/navigation/MainTabs.tsx`
- Test: `__tests__/chatService.test.ts` (thêm)

**Interfaces:**
- Consumes: `subscribeUserChats`, `UserChat` (Task 6); `subscribeUsers`, `AppUser`, `Avatar` (Task 5); `formatListTime` (Task 2)
- Produces: `totalUnread(chats: UserChat[]): number` trong `chatService.ts`

- [ ] **Step 1: Viết test fail:** `subscribeUserChats` với snapshot `{b:{lastTime:1,unread:2,lastMessage:'x'}, c:{lastTime:5,unread:0,lastMessage:'y'}}` thì callback nhận `otherUid` theo thứ tự `['c','b']`. `totalUnread` của danh sách đó bằng `2`.
- [ ] **Step 2:** `npm test` → FAIL. Cài đặt rồi chạy lại → PASS.
- [ ] **Step 3:** Tạo `src/context/ChatsContext.tsx` với `ChatsProvider`, bọc trong `MainTabs`. Provider lắng nghe `subscribeUserChats(uid)` và `subscribeUsers` (mỗi cái hủy trong cleanup) và cung cấp `useChats(): { chats: UserChat[]; users: Record<string, AppUser>; unread: number }`. `HomeScreen` đọc `useChats()` và ghép theo `otherUid`. `ConversationItem` gồm `Avatar` có online, tên, tin cuối (1 dòng, in đậm khi `unread>0`), `formatListTime(lastTime)`, badge tròn số chưa đọc (hiện `99+` khi > 99). Nhấn vào thì mở Chat. Danh sách rỗng thì hiện "Chưa có cuộc trò chuyện nào" và nút "Mở danh bạ".
- [ ] **Step 4:** Trong `MainTabs`, tab "Tin nhắn" có `tabBarBadge = unread || undefined`, lấy `unread` từ `useChats()`. Cần tách component con nằm bên trong `ChatsProvider` để gọi được hook.
- [ ] **Step 5: Verify:** B gửi 3 tin cho A khi A đang ở Home thì badge của A tăng 1→2→3 ngay. A mở chat thì badge về 0. Cuộc trò chuyện mới nhất nằm trên cùng.

### Task 9: Thông báo và hoàn thiện giao diện

**Files:**
- Create: `src/data/notifications.ts`
- Modify: `src/screens/NotificationsScreen.tsx`

**Interfaces:**
- Produces: `type AppNotification = { id: string; icon: string; title: string; body: string; time: string }`; `notifications: AppNotification[]` (6 mục mẫu, ví dụ "Chào mừng bạn đến với ứng dụng", "Bảo mật tài khoản"...)

- [ ] **Step 1:** `NotificationsScreen` hiện `FlatList` các thẻ thông báo, gồm icon MaterialCommunityIcons, tiêu đề, nội dung và thời gian.
- [ ] **Step 2:** Rà toàn app: màu và khoảng cách lấy từ `theme`, chữ tiếng Việt có dấu, `SafeAreaView` đúng trên mọi màn.
- [ ] **Step 3: Verify:** `npx tsc --noEmit`, `npm test` và `npx eslint .` đều sạch. Chạy toàn bộ luồng trên một máy ảo, kiểm lại Review Focus mục 1–5.

### Task 10 (cuối cùng): Máy ảo thứ hai và sản phẩm nộp

**Files:** không có (công việc môi trường và chụp minh chứng). Ảnh lưu vào `E:\project\B23DCCC054_APPDNT_TH05_nop\`.

- [ ] **Step 1:** Kiểm tra dung lượng đĩa và danh sách AVD bằng `emulator -list-avds`. Dọn máy ảo hiện tại (gỡ các app cũ không cần) hoặc tạo AVD thứ hai nhẹ, ví dụ `Pixel_4_API_34` x86_64 dùng image Google APIs, bằng `avdmanager create avd`. Người dùng xác nhận trước khi tải system image (nêu dung lượng).
- [ ] **Step 2:** Chạy 2 máy ảo cùng lúc. Cài APK x86_64 lên cả hai bằng `adb -s <serial> install`, và `adb -s <serial> reverse tcp:8081 tcp:8081` cho từng máy.
- [ ] **Step 3:** Máy 1 đăng nhập A, máy 2 đăng nhập B. Chụp các màn: Đăng ký, Home có số chưa đọc, Danh bạ có online, Chat có tin thường và tin vị trí (`MSYS_NO_PATHCONV=1 adb exec-out screencap -p > file.png`).
- [ ] **Step 4:** Người dùng chụp tab Data của Firebase Console và quay video 1–2 phút (Windows: `Win+Alt+R` hoặc OBS).
- [ ] **Step 5:** Đóng gói mã nguồn thành zip, loại `node_modules`, `android/build`, `android/app/build`, `android/.gradle`, `ios/Pods`.
