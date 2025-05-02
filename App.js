import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PacientsScreen } from './Screens/PacientsScreen';
import { ConsultasScreen } from './Screens/ConsultasScreen';
import { CalendarScreen } from './Screens/CalendarScreen';
import { DoctorsScreen } from './Screens/DoctorsScreen';
import { LoginScreen } from './Screens/LoginScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './context/AppContext';
import { prin_cons } from './Screens/Citas/prin_cons';
import { HomeScreen } from './Screens/HomeScreen'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Login'>
          <Stack.Screen 
            name='Login' 
            component={LoginScreen} 
            options={{ 
              headerShown: false 
            }}
          />
          <Stack.Screen name='Patients' component={PacientsScreen} />
          <Stack.Screen 
            name='ConsultasScreen' 
            component={ConsultasScreen} 
            options={{ 
              headerShown: false
            }}
          />
          <Stack.Screen 
            name='Calendar' 
            component={CalendarScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name='Citas' 
            component={prin_cons}
            options={{ 
              headerShown: false
            }}
          />
          <Stack.Screen 
            name='HomeScreen' 
            component={HomeScreen} 
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name='Doctors' 
            component={DoctorsScreen}
            options={{
              title: 'Gestión de Doctores',
              headerStyle: {
                backgroundColor: '#2196F3',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
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
