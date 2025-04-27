import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PacientsScreen } from './Screens/PacientsScreen';
import { HomeScreen } from './Screens/HomeScreen';
import { ConsultasScreen } from './Screens/ConsultasScreen';
import { CalendarScreen } from './Screens/CalendarScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './context/AppContext';
import { prin_cons } from './Screens/Citas/prin_cons';
import { Min } from './Screens/Pruebas/Min'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer >
        <Stack.Navigator initialRouteName='Home' >
          <Stack.Screen name='Home' component={HomeScreen} />
          <Stack.Screen name='Patients' component={PacientsScreen} />
          <Stack.Screen 
            name='ConsultasScreen' 
            component={ConsultasScreen} 
            options={{ 
              headerShown: false  // Esto ocultará la barra de navegación superior
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
          <Stack.Screen name = 'Min' component={Min} 
           options={{
            headerShown: false
           }}/>
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
