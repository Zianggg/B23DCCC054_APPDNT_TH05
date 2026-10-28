import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import OnlineDot from './OnlineDot';
import { getAvatarColor, getInitials } from '../utils/avatarColor';

type Props = { uid: string; name: string; size?: number; online?: boolean; ringColor?: string };

export default function Avatar({ uid, name, size = 48, online, ringColor }: Props) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: getAvatarColor(uid) },
        ]}>
        <Text style={[styles.text, { fontSize: size * 0.38 }]}>{getInitials(name)}</Text>
      </View>
      {online !== undefined && (
        <View style={styles.dot}>
          <OnlineDot online={online} size={Math.max(13, size * 0.28)} ringColor={ringColor} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '800' },
  dot: { position: 'absolute', right: -1, bottom: -1 },
});
