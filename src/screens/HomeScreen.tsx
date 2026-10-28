import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import ScreenHeader from '../components/ScreenHeader';
import ConversationItem from '../components/ConversationItem';
import EmptyState from '../components/EmptyState';
import { useChats } from '../context/ChatsContext';
import { AppStackParamList, MainTabParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<AppStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { chats, users, unread } = useChats();

  return (
    <View style={styles.safe}>
      <ScreenHeader
        title="Tin nhắn"
        subtitle={unread > 0 ? `${unread} tin nhắn chưa đọc` : 'Bạn đã đọc hết tin nhắn'}
      />
      <FlatList
        data={chats}
        keyExtractor={c => c.otherUid}
        renderItem={({ item }) => (
          <ConversationItem
            chat={item}
            user={users[item.otherUid]}
            onPress={() => navigation.navigate('Chat', { otherUid: item.otherUid })}
          />
        )}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="chat-outline"
            title="Chưa có cuộc trò chuyện nào"
            actionLabel="Mở danh bạ"
            onAction={() => navigation.navigate('Contacts')}
          />
        }
      />
    </View>
  );
}

const Separator = () => <View style={styles.sep} />;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { paddingTop: spacing.lg, paddingBottom: spacing.xl },
  sep: { height: spacing.sm },
});
