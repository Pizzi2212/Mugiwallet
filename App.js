import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import WelcomeScreen from './components/WelcomeScreen'
import HomeScreen from './components/HomeScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialBalance, setHasInitialBalance] = useState(false)

  useEffect(() => {
    // const resetData = async () => {
    // await AsyncStorage.removeItem('initialBalance')
    // }
    // resetData()
    const checkInitialBalance = async () => {
      const balance = await AsyncStorage.getItem('initialBalance')
      setHasInitialBalance(!!balance)
      setIsLoading(false)
    }

    checkInitialBalance()
  }, [])

  if (isLoading) return null

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {hasInitialBalance ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
