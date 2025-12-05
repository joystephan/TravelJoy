import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  userName?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  isDestructive?: boolean;
}

export default function DrawerMenu({
  visible,
  onClose,
  navigation,
  userName = 'Traveler',
}: DrawerMenuProps) {
  const { logout } = useAuth();
  const [user, setUser] = React.useState<any>(null);
  const slideAnim = React.useRef(new Animated.Value(DRAWER_WIDTH)).current;

  React.useEffect(() => {
    loadUser();
  }, []);

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: DRAWER_WIDTH,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [visible]);

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLogout = () => {
    onClose();
    setTimeout(() => {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]);
    }, 300);
  };

  const handleMenuItemPress = (onPress: () => void) => {
    onClose();
    setTimeout(() => {
      onPress();
    }, 300);
  };

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      id: 'help',
      label: 'Help & FAQ',
      icon: '❓',
      onPress: () => navigation.navigate('HelpFAQ'),
    },
    {
      id: 'contact',
      label: 'Contact Support',
      icon: '📧',
      onPress: () => navigation.navigate('ContactSupport'),
    },
    {
      id: 'terms',
      label: 'Terms of Service',
      icon: '📄',
      onPress: () => navigation.navigate('TermsOfService'),
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: '🔒',
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: '🚪',
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.drawerContent}>
            {/* Header with Gradient Background */}
            <View style={styles.header}>
              <View style={styles.headerGradient}>
                <View style={styles.userInfo}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {(user?.firstName || userName).charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {user?.firstName || userName}
                    </Text>
                    <Text style={styles.userEmail}>
                      {user?.email || 'user@traveljoy.com'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu Items */}
            <ScrollView 
              style={styles.menuItems}
              showsVerticalScrollIndicator={false}
            >
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    item.isDestructive && styles.menuItemDestructive,
                    index === 0 && styles.firstMenuItem,
                  ]}
                  onPress={() => handleMenuItemPress(item.onPress)}
                  activeOpacity={0.6}
                >
                  <View style={styles.menuItemContent}>
                    <View style={styles.menuIconContainer}>
                      <Text style={styles.menuIcon}>{item.icon}</Text>
                    </View>
                    <Text
                      style={[
                        styles.menuLabel,
                        item.isDestructive && styles.menuLabelDestructive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Text style={[
                    styles.menuArrow,
                    item.isDestructive && styles.menuArrowDestructive,
                  ]}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerContent}>
                <Text style={styles.footerText}>TravelJoy</Text>
                <Text style={styles.footerVersion}>v1.0.0</Text>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.white,
    ...shadows.lg,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerGradient: {
    backgroundColor: colors.primary,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  avatarText: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: colors.white,
    fontWeight: '600',
  },
  menuItems: {
    flex: 1,
  },
  firstMenuItem: {
    marginTop: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.sm,
    marginVertical: 2,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
  },
  menuItemDestructive: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  menuLabelDestructive: {
    color: colors.error,
    fontWeight: '600',
  },
  menuArrow: {
    fontSize: 28,
    color: colors.textSecondary,
    fontWeight: '300',
    marginLeft: spacing.sm,
  },
  menuArrowDestructive: {
    color: colors.error,
  },
  footer: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    backgroundColor: colors.gray50,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  footerVersion: {
    ...typography.caption,
    color: colors.textLight,
  },
});

