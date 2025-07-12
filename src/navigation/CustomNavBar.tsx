import {View, Platform, StyleSheet, TouchableOpacity, Keyboard} from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {FadeIn, FadeOut, LinearTransition} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const PRIMARY_COLOR = '#ff6e00';
const SECONDARY_COLOR = '#fff';
const OPTIONAL_COLOR = '#0B6623';

// @ts-ignore
const CustomNavBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation, keyboardVisible }) => {
    if (keyboardVisible) return null;
    const { colors } = useTheme();
    const { buildHref } = useLinkBuilder();

    return (
        <View style={styles.container}>
            {state.routes.map((route, index) => {

                if(['_sitemap', "+not-founded"].includes(route.name)) return null;

                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

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
                        layout={LinearTransition.springify().mass(0.5)}
                        key={route.key}
                        onPress={onPress}
                        style={[styles.tabItem, {backgroundColor: isFocused ? OPTIONAL_COLOR : "transparent"}]}
                    >
                        {getIconByRouteName(route.name, isFocused ? SECONDARY_COLOR : SECONDARY_COLOR)}
                        {isFocused && <Animated.Text entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.text}>
                            {label as string}
                        </Animated.Text>}
                    </AnimatedTouchableOpacity>
                );
            })}
        </View>
    );
    function getIconByRouteName(routeName: string, color: string) {
        switch (routeName) {
            case 'Crypto':
                return <FontAwesome6 name="bitcoin" size={18} color={color} />;
                case 'Forex':
                    // return <FontAwesome6 name="chart-line" size={18} color={color} />;
                    return <Text style={styles.fxText}>FX</Text>
                    case 'Settings':
                        return <Feather name="settings" size={18} color={color} />;
                        case 'Premium':
                            return <FontAwesome6 name="crown" size={18} color={color} />;
        }
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: PRIMARY_COLOR,
        width: '85%',
        alignSelf: 'center',
        bottom: 30,
        borderRadius: 40,
        paddingVertical: 12,
        paddingHorizontal: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
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
        fontWeight: "500"
    },
    fxText: {
        fontFamily: 'Rubik-Bold',  // Ensure this matches your loaded font name
        color: '#FFFFFF',          // or 'white'
        fontSize: 16,              // optional: customize as needed
    },
});

export default CustomNavBar;