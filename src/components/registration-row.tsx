import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, T, usePalette } from '@/components/ui';
import { Space } from '@/constants/theme';
import { timeAgo, type Registration } from '@/lib/registrations';

export function RegistrationRow({ item }: { item: Registration }) {
  const c = usePalette();
  return (
    <Link href={{ pathname: '/registro/[id]', params: { id: item.id } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.object}, em ${item.location}`}>
        <Card style={styles.row}>
          <View style={[styles.pin, { backgroundColor: c.pinBg }]}>
            <Ionicons name="location-outline" size={20} color={c.pin} />
          </View>
          <View style={styles.text}>
            <T variant="subtitle" style={{ fontSize: 16 }} numberOfLines={1}>
              {item.object}
            </T>
            <T muted numberOfLines={2} style={{ fontSize: 14, lineHeight: 20 }}>
              {item.location}
            </T>
          </View>
          <T variant="caption" style={{ color: c.textMuted }}>
            {timeAgo(item.created_at)}
          </T>
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  pin: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2, minWidth: 0 },
});
