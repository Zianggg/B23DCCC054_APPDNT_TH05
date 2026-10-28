import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
