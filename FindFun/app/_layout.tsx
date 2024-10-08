import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import 'react-native-reanimated';

// Import your screens here
import WelcomeScreen from '@/app/index.tsx';
import BuildDayScreen from '@/app/BuildDay.tsx';
import ExploreScreen from '@/app/explore.tsx';
import CityDescription from '@/app/CityDescription.tsx';
import ActivityChoice from '@/app/ActivityChoice.tsx';
import Results from '@/app/Results.tsx'



// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Stack Navigator for routing inside tabs
const Stack = createStackNavigator();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Define the stack navigator for the Home tab
  function HomeStackNavigator() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="CityDescription" component={CityDescription} />
        <Stack.Screen name="ActivityChoice" component={ActivityChoice} />
        <Stack.Screen name="Results" component={Results} />
      </Stack.Navigator>
    );
  }

  // Define the tab bar layout (formerly layout.tsx)
  function TabNavigator() {
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,  // Hide header globally
        }}
      >
        {/* Home Tab */}
        <Tab.Screen
          name="index"
          component={HomeStackNavigator}  // Use HomeStackNavigator instead of WelcomeScreen
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            ),
            headerShown: false,
          }}
        />

        {/* Build Your Day Tab */}
        <Tab.Screen
          name="BuildDay"
          component={BuildDayScreen}
          options={{
            title: 'Build Your Day',
            tabBarIcon: ({ color, focused }) => (
              <Entypo name={focused ? 'air' : 'air'} color={color} size={30} />
            ),
          }}
        />

        {/* Account Tab */}
        <Tab.Screen
          name="explore"
          component={ExploreScreen}
          options={{
            title: 'Account',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons name={focused ? 'account-circle' : 'account-circle'} color={color} size={30} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // Stack navigator for managing the entire app's routing
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Directly use the TabNavigator without the "Main" route */}
      <TabNavigator />
    </ThemeProvider>
  );
}
