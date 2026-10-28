import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import ChatScreen from '../screens/ChatScreen';
import { ChatsProvider } from '../context/ChatsContext';
import { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <ChatsProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </ChatsProvider>
  );
}
