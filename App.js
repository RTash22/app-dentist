import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './Screens/LoginScreen';
import { HomeScreen } from './Screens/HomeScreen';
import { PacientsScreen } from './Screens/PacientsScreen';
import { ConsultasScreen } from './Screens/ConsultasScreen';
import { CalendarScreen } from './Screens/CalendarScreen';
import { AppProvider } from './context/AppContext';
import { prin_cons } from './Screens/Citas/prin_cons';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <AppProvider>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="Pacients" component={PacientsScreen} />
          <Stack.Screen name="Consultas" component={ConsultasScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="PrinCons" component={prin_cons} />
        </Stack.Navigator>
      </AppProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
