import { StyleSheet } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { PacientsScreen } from "./Screens/PacientsScreen"
import { ConsultasScreen } from "./Screens/ConsultasScreen"
import { CalendarScreen } from "./Screens/CalendarScreen"
import { DoctorsScreen } from "./Screens/DoctorsScreen"
import { LoginScreen } from "./Screens/LoginScreen"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { AppProvider, useAppContext } from "./context/AppContext"
import { prin_cons } from "./Screens/Citas/prin_cons"
import { HomeScreen } from "./Screens/HomeScreen"
import AdminHomeScreen from "./Screens/AdminHomeScreen"

const Stack = createNativeStackNavigator()

// Componente de navegación que verifica permisos
function AppNavigator() {
  const { isAdmin, isAuthenticated, loadingUser } = useAppContext()

  // Si está cargando, no renderizar nada aún
  if (loadingUser) {
    return null
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={
          !isAuthenticated ? "Login" : 
          isAdmin ? "AdminHomeScreen" : "HomeScreen"
        }
      >
        {!isAuthenticated ? (
          // Rutas para usuarios no autenticados
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          // Rutas para usuarios autenticados
          <>
            <Stack.Screen
              name="HomeScreen"
              component={HomeScreen}
              options={{
                headerShown: false,
              }}
            />
            
            {/* Pantalla específica para administradores */}
            <Stack.Screen
              name="AdminHomeScreen"
              component={AdminHomeScreen}
              options={{
                headerShown: false,
              }}
            />
            
            <Stack.Screen name="Patients" component={PacientsScreen} />
            <Stack.Screen
              name="ConsultasScreen"
              component={ConsultasScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Citas"
              component={prin_cons}
              options={{
                headerShown: false,
              }}
            />

            {/* Accesible para todos los usuarios autenticados */}
            <Stack.Screen
              name="Doctors"
              component={DoctorsScreen}
              options={{
                title: "Gestión de Doctores",
                headerStyle: {
                  backgroundColor: "#2196F3",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
})
