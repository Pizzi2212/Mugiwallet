import React, { useEffect, useState } from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function HomeScreen() {
  const [balance, setBalance] = useState('0')

  useEffect(() => {
    const getBalance = async () => {
      const saved = await AsyncStorage.getItem('initialBalance')
      setBalance(saved || '0')
    }
    getBalance()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saldo attuale</Text>
      <Text style={styles.balance}>€ {balance}</Text>
      {/*entrate/uscite */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, marginBottom: 10 },
  balance: { fontSize: 36, fontWeight: 'bold' },
})
