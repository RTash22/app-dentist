import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PacientsScreen } from './Screens/PacientsScreen';
import { HomeScreen } from './Screens/HomeScreen';
import { ConsultasScreen } from './Screens/ConsultasScreen';
import { CalendarScreen } from './Screens/CalendarScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './context/AppContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer >
        <Stack.Navigator initialRouteName='Home' >
          <Stack.Screen name='Home' component={HomeScreen} />
          <Stack.Screen name='Patients' component={PacientsScreen} />
          <Stack.Screen name='Consultas' component={ConsultasScreen} />
          <Stack.Screen 
            name='Calendar' 
            component={CalendarScreen}
            options={{ title: 'Calendario de Consultas' }}
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
