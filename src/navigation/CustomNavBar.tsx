import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@react-navigation/elements';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'; // Simplified animation imports
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { Image } from 'react-native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const PRIMARY_COLOR = '#ff6e00';
const SECONDARY_COLOR = '#fff';
const OPTIONAL_COLOR = '#0B6623';
const UNFOCUSED_ICON_COLOR = '#fff';

interface CustomNavBarProps extends BottomTabBarProps {
  keyboardVisible?: boolean;
}

const CustomNavBar: React.FC<CustomNavBarProps> = ({ state, descriptors, navigation, keyboardVisible }) => {
  if (keyboardVisible) return null;

  const activeRouteName = state.routes[state.index]?.name; // Cross-check active route

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        if ([' _sitemap', '+not-founded'].includes(route.name)) return null;

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index || route.name === activeRouteName; // Dual check for robustness

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <AnimatedTouchableOpacity
            // Simplified layout transition to avoid Android glitches
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabItem,
              { backgroundColor: isFocused ? OPTIONAL_COLOR : 'transparent' },
            ]}
          >
            {getIconByRouteName(route.name, isFocused ? SECONDARY_COLOR : UNFOCUSED_ICON_COLOR)}
            {isFocused && (
              <Animated.Text entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.text}>
                {label as string}
              </Animated.Text>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
};

function getIconByRouteName(routeName: string, color: string) {
  const iconMap: Record<string, JSX.Element> = {
    Crypto: <FontAwesome6 name="bitcoin" size={18} color={color} />,
    Forex: <Text style={[styles.fxText, { color }]}>FX</Text>,
    Deriv: (
      <Image
        source={require('../../assets/images/deriv_icon.png')}
        style={{
          width: 15,
          height: 18,
          resizeMode: 'contain',
          tintColor: color,
        }}
      />
    ),
    Settings: <Feather name="settings" size={18} color={color} />,
    Premium: <FontAwesome6 name="crown" size={18} color={color} />,
  };

  return iconMap[routeName] || null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    width: '85%', //adjust here for the width of the navigation bar
    alignSelf: 'center',
    bottom: 30,
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 15,
    ...(Platform.OS === 'ios'
      ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      }
      : {
        elevation: 8,
        // Android-specific: Force layout recalculation
        overflow: 'hidden', // Prevent overlap issues
      }),
  },
  tabItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 30,
  },
  text: {
    color: SECONDARY_COLOR,
    marginLeft: 8,
    fontWeight: '500',
  },
  fxText: {
    fontFamily: 'Rubik-Bold',
    fontSize: 16,
  },
});

export default CustomNavBar;