import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ChatHeader from '../components/ChatHeader';
import ChatInput from '../components/ChatInput';
import MessageBubble from '../components/MessageBubble';
import { useAuth } from '../context/AuthContext';
import { useChats } from '../context/ChatsContext';
import { markAsRead, Message, sendLocation, sendText, subscribeMessages } from '../services/chatService';
import { getCurrentPosition, requestLocationPermission } from '../services/locationService';
import { getChatId } from '../utils/chatId';
import { AppStackParamList } from '../navigation/types';
import { colors, font, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Chat'>;

export default function ChatScreen({ navigation, route }: Props) {
  const { otherUid } = route.params;
  const myUid = useAuth().user?.uid ?? '';
  const { users, chats } = useChats();
  const chatId = getChatId(myUid, otherUid);
  const [messages, setMessages] = useState<Message[]>([]);
  const listRef = useRef<FlatList<Message>>(null);
  const insets = useSafeAreaInsets();
  // Khi bàn phím mở thì không cần chừa chỗ cho thanh điều hướng hệ thống
  const [keyboardShown, setKeyboardShown] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardShown(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardShown(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  // Chỉ tin đến sau lúc mở màn mới có hiệu ứng bay vào
  const openedAt = useRef(Date.now() - 1500);

  // Lắng nghe tin mới; hủy khi rời màn để không bị nhân đôi tin
  useEffect(() => {
    setMessages([]);
    const unsubscribe = subscribeMessages(
      chatId,
      msg => setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg])),
      id => setMessages(prev => prev.filter(m => m.id !== id)),
    );
    return unsubscribe;
  }, [chatId]);

  // Đang mở cuộc trò chuyện thì số chưa đọc luôn về 0
  const myUnread = chats.find(c => c.otherUid === otherUid)?.unread ?? 0;
  useEffect(() => {
    if (myUnread > 0) {
      markAsRead(myUid, otherUid).catch(() => {});
    }
  }, [myUnread, myUid, otherUid]);

  const onSend = async (text: string) => {
    try {
      await sendText(myUid, otherUid, text);
    } catch (e: any) {
      Alert.alert(
        'Lỗi',
        e?.message === 'OFFLINE'
          ? 'Không có kết nối mạng, tin nhắn chưa được gửi'
          : 'Không gửi được tin nhắn',
      );
      throw e;
    }
  };

  const onSendLocation = async () => {
    const granted = await requestLocationPermission();
    if (!granted) {
      Alert.alert(
        'Không có quyền vị trí',
        'Bạn đã từ chối quyền truy cập vị trí. Hãy bật lại trong Cài đặt để gửi vị trí.',
      );
      return;
    }
    try {
      const { lat, lng } = await getCurrentPosition();
      await sendLocation(myUid, otherUid, lat, lng);
    } catch {
      Alert.alert('Lỗi', 'Không lấy được vị trí hiện tại');
    }
  };

  const inputPadding = { paddingBottom: keyboardShown ? 0 : insets.bottom };

  return (
    <View style={styles.safe}>
      <ChatHeader uid={otherUid} user={users[otherUid]} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              mine={item.senderId === myUid}
              animateIn={(item.createdAt ?? Date.now()) > openedAt.current}
            />
          )}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Hãy gửi lời chào đầu tiên 👋</Text>
            </View>
          }
        />
        <View style={[styles.inputWrap, inputPadding]}>
          <ChatInput onSend={onSend} onSendLocation={onSendLocation} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  inputWrap: { backgroundColor: colors.surface },
  list: { paddingVertical: spacing.md, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textMuted, fontSize: font.body },
});
