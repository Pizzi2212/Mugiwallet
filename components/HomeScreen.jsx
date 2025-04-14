import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ImageBackground,
} from 'react-native'
import { PieChart } from 'react-native-chart-kit'
import { Dimensions } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import dayjs from 'dayjs'
import 'dayjs/locale/it'
import Icon from 'react-native-vector-icons/FontAwesome'

const screenWidth = Dimensions.get('window').width

const categories = [
  { key: 'Salute', color: '#f44336', emoji: '❤️' },
  { key: 'Ristorante', color: '#ff9800', emoji: '🍽️' },
  { key: 'Spesa', color: '#ffeb3b', emoji: '🛒' },
  { key: 'Benzina', color: '#4caf50', emoji: '⛽' },
  { key: 'Casa', color: '#3f51b5', emoji: '🏡' },
  { key: 'Mezzi', color: '#9c27b0', emoji: '🚌' },
  { key: 'Regali', color: '#00bcd4', emoji: '🎁' },
  { key: 'Shopping', color: '#2196f3', emoji: '👕' },
  { key: 'Viaggi', color: '#3f51b5', emoji: '✈️' },
  { key: 'Abbonamenti', color: '#9c27b0', emoji: '📺' },
  { key: 'Svago', color: '#00bcd4', emoji: '🎮' },
  { key: 'Altro', color: '#607d8b', emoji: '❓' },
  { key: 'Extra', color: '#f44336', emoji: '➕' },
]

export default function MonthlyExpenseScreen() {
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [filteredIncome, setFilteredIncome] = useState([])
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [amount, setAmount] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [balances, setBalances] = useState([])
  const [currentBalanceId, setCurrentBalanceId] = useState(null)
  const [newBalanceName, setNewBalanceName] = useState('')
  const [transferModalVisible, setTransferModalVisible] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const [fromBalanceId, setFromBalanceId] = useState(null)
  const [toBalanceId, setToBalanceId] = useState(null)
  const [extraModalVisible, setExtraModalVisible] = useState(false)
  const [extraDescription, setExtraDescription] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editedBalance, setEditedBalance] = useState(null)
  const [editedName, setEditedName] = useState('')
  const [initialAmount, setInitialAmount] = useState('')
  const [showInitialBalanceScreen, setShowInitialBalanceScreen] =
    useState(false)

  useEffect(() => {
    dayjs.locale('it')
    loadInitialData()
  }, [])

  // useEffect(() => {
  //   const resetBalances = async () => {
  //     const resetBalances = balances.map((balance) => ({
  //       ...balance,
  //       amount: 0,
  //     }))
  //     setBalances(resetBalances)
  //     await AsyncStorage.setItem('balances', JSON.stringify(resetBalances))
  //     setExpenses([])
  //     setIncome([])
  //     await AsyncStorage.setItem('expenses', JSON.stringify([]))
  //     await AsyncStorage.setItem('income', JSON.stringify([]))
  //     setAmount('')
  //   }

  //   resetBalances()
  // }, [])

  const loadInitialData = async () => {
    const data = await AsyncStorage.getItem('balances')
    if (data) {
      const parsedData = JSON.parse(data)
      setBalances(parsedData)
      if (parsedData.length > 0) {
        setCurrentBalanceId(parsedData[0].id)
        if (parsedData.some((b) => b.amount > 0)) {
          setShowInitialBalanceScreen(false)
          setIsBalanceSet(true)
        } else {
          setShowInitialBalanceScreen(true)
        }
      } else {
        setShowInitialBalanceScreen(true)
      }
    } else {
      setShowInitialBalanceScreen(true)
    }

    loadExpenses()
    loadIncome()
  }

  const loadExpenses = async () => {
    const data = await AsyncStorage.getItem('expenses')
    if (data) setExpenses(JSON.parse(data))
  }

  const loadIncome = async () => {
    const data = await AsyncStorage.getItem('income')
    if (data) setIncome(JSON.parse(data))
  }

  const loadBalances = async () => {
    const data = await AsyncStorage.getItem('balances')
    if (data) {
      const parsedData = JSON.parse(data)
      setBalances(parsedData)
      if (parsedData.length > 0 && !currentBalanceId) {
        setCurrentBalanceId(parsedData[0].id)
      }
    } else {
      const defaultBalance = [{ id: '1', name: 'Principale', amount: 0 }]
      await AsyncStorage.setItem('balances', JSON.stringify(defaultBalance))
      setBalances(defaultBalance)
      setCurrentBalanceId('1')
    }
  }

  useEffect(() => {
    const filteredExpenses = expenses.filter((e) =>
      dayjs(e.date).isSame(currentMonth, 'month')
    )
    const filteredIncome = income.filter((e) =>
      dayjs(e.date).isSame(currentMonth, 'month')
    )
    setFilteredExpenses(filteredExpenses)
    setFilteredIncome(filteredIncome)
  }, [expenses, income, currentMonth])

  const handleInitialAmountChange = (value) => {
    const formattedValue = value.replace(',', '.')
    setInitialAmount(formattedValue)
  }

  const saveInitialBalance = async () => {
    if (!initialAmount) {
      Alert.alert('Errore', 'Inserisci un importo per il saldo iniziale')
      return
    }

    const newBalance = {
      id: '1',
      name: 'Principale',
      amount: parseFloat(initialAmount),
    }

    const updatedBalances = [newBalance]
    setBalances(updatedBalances)

    await AsyncStorage.setItem('balances', JSON.stringify(updatedBalances))
    await AsyncStorage.setItem('hasLaunched', 'true')
    await AsyncStorage.setItem('initialBalanceSet', 'true')

    setShowInitialBalanceScreen(false)
    setInitialAmount('')
    setCurrentBalanceId('1')
  }

  const saveExpense = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Errore', 'Inserisci un importo e seleziona una categoria')
      return
    }
    const newExpense = {
      amount: parseFloat(amount),
      category: selectedCategory,
      description: selectedCategory === 'Extra' ? extraDescription : null,
      date: currentMonth.toISOString(),
      balanceId: currentBalanceId,
    }
    const newExpenses = [...expenses, newExpense]
    setExpenses(newExpenses)
    await AsyncStorage.setItem('expenses', JSON.stringify(newExpenses))
    setAmount('')
    setSelectedCategory(null)
    await updateBalance(currentBalanceId, -parseFloat(amount))
  }

  const saveIncome = async () => {
    if (!incomeAmount) {
      Alert.alert('Errore', 'Inserisci un importo per aggiungere denaro')
      return
    }
    const newIncome = {
      amount: parseFloat(incomeAmount),
      date: currentMonth.toISOString(),
      balanceId: currentBalanceId,
    }
    const newIncomeArray = [...income, newIncome]
    setIncome(newIncomeArray)
    await AsyncStorage.setItem('income', JSON.stringify(newIncomeArray))
    setIncomeAmount('')
    await updateBalance(currentBalanceId, parseFloat(incomeAmount))
  }

  const handleAmountChange = (value) => {
    const formattedValue = value.replace(',', '.')
    setAmount(formattedValue)
  }

  const handleIncomeAmountChange = (value) => {
    const formattedValue = value.replace(',', '.')
    setIncomeAmount(formattedValue)
  }

  const updateBalance = async (balanceId, amount) => {
    const updatedBalances = balances.map((balance) => {
      if (balance.id === balanceId) {
        return {
          ...balance,
          amount: balance.amount + amount,
        }
      }
      return balance
    })
    setBalances(updatedBalances)
    await AsyncStorage.setItem('balances', JSON.stringify(updatedBalances))
  }

  const addNewBalance = async () => {
    if (!newBalanceName.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per il nuovo saldo')
      return
    }
    const newBalance = {
      id: Date.now().toString(),
      name: newBalanceName.trim(),
      amount: 0,
    }
    const updatedBalances = [...balances, newBalance]
    setBalances(updatedBalances)
    await AsyncStorage.setItem('balances', JSON.stringify(updatedBalances))
    setNewBalanceName('')
  }

  const transferFunds = async () => {
    if (
      !fromBalanceId ||
      !toBalanceId ||
      !transferAmount ||
      fromBalanceId === toBalanceId
    ) {
      Alert.alert(
        'Errore',
        'Seleziona due saldi diversi e inserisci un importo valido'
      )
      return
    }

    const amount = parseFloat(transferAmount)
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Errore', 'Inserisci un importo valido e maggiore di zero')
      return
    }

    const fromBalance = balances.find((b) => b.id === fromBalanceId)
    if (!fromBalance || fromBalance.amount < amount) {
      Alert.alert('Errore', 'Saldo insufficiente per il trasferimento')
      return
    }
    const updatedBalances = balances.map((balance) => {
      if (balance.id === fromBalanceId) {
        return { ...balance, amount: balance.amount - amount }
      }
      if (balance.id === toBalanceId) {
        return { ...balance, amount: balance.amount + amount }
      }
      return balance
    })

    setBalances(updatedBalances)
    await AsyncStorage.setItem('balances', JSON.stringify(updatedBalances))

    setTransferModalVisible(false)
    setTransferAmount('')
    setFromBalanceId(null)
    setToBalanceId(null)

    Alert.alert('Successo', 'Trasferimento effettuato con successo')
  }

  const getCurrentBalance = () => {
    return balances.find((b) => b.id === currentBalanceId) || { amount: 0 }
  }

  const getTotalExpenses = () => {
    return filteredExpenses
      .filter((e) => e.balanceId === currentBalanceId)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0)
  }

  const getTotalIncome = () => {
    return filteredIncome
      .filter((e) => e.balanceId === currentBalanceId)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0)
  }

  const getChartData = () => {
    const sums = {}
    filteredExpenses
      .filter((e) => e.balanceId === currentBalanceId)
      .forEach((e) => {
        const key =
          e.category === 'Extra' && e.description ? e.description : e.category
        sums[key] = (sums[key] || 0) + parseFloat(e.amount)
      })

    return Object.entries(sums).map(([key, value]) => {
      const cat =
        categories.find((c) => c.key === key) ||
        categories.find((c) => c.key === 'Extra')
      if (key.length > 12) {
        return {
          name: `${key.slice(0, 12)}...`,
          amount: value,
          color: cat?.color || '#ccc',
          legendFontColor: '#fff',
          legendFontSize: 14,
        }
      }
      return {
        name: key,
        amount: value,
        color: cat?.color || '#ccc',
        legendFontColor: '#fff',
        legendFontSize: 14,
      }
    })
  }

  const balanceDifference = () => {
    const totalIncome = getTotalIncome()
    const totalExpenses = getTotalExpenses()
    return totalIncome - totalExpenses
  }

  const openEditModal = (balance) => {
    setEditedBalance(balance)
    setEditedName(balance.name)
    setEditModalVisible(true)
  }

  const saveEditedBalance = async () => {
    const updatedBalances = balances.map((b) =>
      b.id === editedBalance.id ? { ...b, name: editedName.trim() } : b
    )
    setBalances(updatedBalances)
    await AsyncStorage.setItem('balances', JSON.stringify(updatedBalances))
    setEditModalVisible(false)
  }

  const deleteBalance = async (balanceId) => {
    if (balances.length === 1) {
      Alert.alert('Errore', 'Non puoi eliminare l unico saldo esistente.')
      return
    }

    const balanceToDelete = balances.find((b) => b.id === balanceId)

    if (!balanceToDelete) return

    const amount = balanceToDelete.amount || 0

    if (amount > 0) {
      Alert.alert(
        'Trasferire i fondi?',
        'Questo conto ha ancora soldi. Vuoi trasferirli in un altro conto prima di eliminarlo?',
        [
          { text: 'Annulla', style: 'cancel' },
          {
            text: 'Sì, trasferisci',
            onPress: () => {
              const otherBalances = balances.filter((b) => b.id !== balanceId)

              const otherNames = otherBalances.map((b) => b.name).join(', ')
              Alert.prompt(
                'Trasferisci a:',
                `Scrivi il nome di uno dei seguenti conti: ${otherNames}`,
                [
                  {
                    text: 'Annulla',
                    style: 'cancel',
                  },
                  {
                    text: 'Conferma',
                    onPress: async (destName) => {
                      const destBalance = otherBalances.find(
                        (b) => b.name === destName
                      )
                      if (!destBalance) {
                        Alert.alert('Errore', 'Conto non trovato.')
                        return
                      }

                      // Trasferisci i fondi
                      const updatedBalances = balances.map((b) => {
                        if (b.id === balanceId) return { ...b, amount: 0 }
                        if (b.id === destBalance.id)
                          return {
                            ...b,
                            amount: b.amount + amount,
                          }
                        return b
                      })

                      // Procedi con l'eliminazione
                      confirmDelete(balanceId, updatedBalances)
                    },
                  },
                ],
                'plain-text'
              )
            },
          },
          {
            text: 'No, elimina senza trasferire',
            style: 'destructive',
            onPress: () => confirmDelete(balanceId),
          },
        ]
      )
    } else {
      confirmDelete(balanceId)
    }
  }

  const confirmDelete = async (balanceId, customBalances = null) => {
    Alert.alert(
      'Conferma eliminazione',
      'Sei sicuro di voler eliminare questo saldo? I dati collegati andranno persi.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            const balancesToUse = customBalances || balances
            const updatedBalances = balancesToUse.filter(
              (b) => b.id !== balanceId
            )
            const updatedExpenses = expenses.filter(
              (e) => e.balanceId !== balanceId
            )
            const updatedIncome = income.filter(
              (i) => i.balanceId !== balanceId
            )

            setBalances(updatedBalances)
            setExpenses(updatedExpenses)
            setIncome(updatedIncome)

            if (currentBalanceId === balanceId) {
              setCurrentBalanceId(updatedBalances[0]?.id || null)
            }

            await AsyncStorage.setItem(
              'balances',
              JSON.stringify(updatedBalances)
            )
            await AsyncStorage.setItem(
              'expenses',
              JSON.stringify(updatedExpenses)
            )
            await AsyncStorage.setItem('income', JSON.stringify(updatedIncome))
          },
        },
      ]
    )
  }

  return (
    <ScrollView style={styles.container}>
      {showInitialBalanceScreen ? (
        <View style={styles.initialBalanceContainer}>
          <Text style={styles.initialBalanceText}>
            Attualmente quanti soldi hai?
          </Text>
          <TextInput
            style={styles.input}
            value={initialAmount}
            onChangeText={handleInitialAmountChange}
            placeholder="Inserisci il saldo iniziale"
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={saveInitialBalance} style={styles.button}>
            <Text style={styles.buttonText}>Salva Saldo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.addBalanceContainer}>
            <Text style={styles.title}>
              Spese - {currentMonth.format('MMMM YYYY')}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nuovo nome saldo"
              placeholderTextColor="#ccc"
              value={newBalanceName}
              onChangeText={setNewBalanceName}
            />
            <TouchableOpacity
              onPress={addNewBalance}
              style={styles.addBalanceButton}
            >
              <Text style={styles.addBalanceButtonText}>Aggiungi Saldo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.balanceSelector}>
            {balances.map((balance) => (
              <View key={balance.id} style={styles.balanceItem}>
                <TouchableOpacity
                  style={[
                    styles.balanceButton,
                    currentBalanceId === balance.id &&
                      styles.selectedBalanceButton,
                  ]}
                  onPress={() => setCurrentBalanceId(balance.id)}
                >
                  <Text style={styles.balanceButtonText}>{balance.name}</Text>
                  <Text style={styles.balanceButtonText}>
                    {balance.amount.toFixed(2)} €
                  </Text>
                </TouchableOpacity>

                <View style={styles.balanceActions}>
                  <TouchableOpacity onPress={() => openEditModal(balance)}>
                    <Icon name="pencil" size={16} color="#ccc" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteBalance(balance.id)}>
                    <Icon name="trash" size={16} color="#f44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balance}>
              Saldo attuale: {getCurrentBalance().amount.toFixed(2)} €
            </Text>
            <TouchableOpacity
              onPress={() => setTransferModalVisible(true)}
              style={styles.transferButton}
            >
              <Text style={styles.transferButtonText}>Trasferisci</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Aggiungi denaro"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            value={incomeAmount}
            onChangeText={handleIncomeAmountChange}
          />
          <TouchableOpacity onPress={saveIncome} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Aggiungi denaro</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Importo spesa"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            value={amount}
            onChangeText={handleAmountChange}
          />

          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key)}
                style={[
                  styles.categoryBtn,
                  selectedCategory === cat.key && {
                    backgroundColor: cat.color,
                  },
                ]}
              >
                <Text style={styles.categoryText}>{cat.emoji}</Text>
                <Text style={styles.categoryText2}>{cat.key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => {
              if (selectedCategory === 'Extra') {
                setExtraModalVisible(true)
              } else {
                saveExpense()
              }
            }}
            style={styles.saveBtn}
          >
            <Text style={styles.saveBtnText}>Aggiungi Spesa</Text>
          </TouchableOpacity>

          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
            >
              <Icon name="chevron-left" size={20} color="white" />
            </TouchableOpacity>

            <Text style={styles.monthText}>
              {currentMonth.format('MMMM YYYY')}
            </Text>

            <TouchableOpacity
              onPress={() =>
                currentMonth.isBefore(dayjs().startOf('month')) &&
                setCurrentMonth(currentMonth.add(1, 'month'))
              }
              disabled={currentMonth.isSame(dayjs().startOf('month'), 'month')}
            >
              <Icon
                name="chevron-right"
                size={20}
                color={
                  currentMonth.isSame(dayjs().startOf('month'), 'month')
                    ? '#ccc'
                    : 'white'
                }
              />
            </TouchableOpacity>
          </View>

          <PieChart
            data={getChartData()}
            width={screenWidth - 20}
            height={220}
            chartConfig={{
              color: () => `white`,
              labelColor: () => 'white',
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="10"
            center={[10, 10]}
            absolute
          />

          <Text style={styles.total}>
            Totale Spese: {getTotalExpenses().toFixed(2)} €
          </Text>
          <Text style={styles.total}>
            Totale Entrate: {getTotalIncome().toFixed(2)} €
          </Text>
          <Text style={styles.total}>
            Soldi risparmiati: {balanceDifference().toFixed(2)} €
          </Text>

          {getChartData().map((item, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.label}>{item.name}</Text>
              <Text style={styles.percent}>
                {(
                  (item.amount / Math.max(1, getTotalExpenses())) *
                  100
                ).toFixed(0)}
                %
              </Text>
              <Text style={styles.amount}>{item.amount.toFixed(2)} €</Text>
            </View>
          ))}
        </>
      )}

      {/* Modal per il trasferimento fondi */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={transferModalVisible}
        onRequestClose={() => setTransferModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Trasferisci fondi</Text>

            <TextInput
              style={styles.input}
              placeholder="Importo"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              value={transferAmount}
              onChangeText={setTransferAmount}
            />

            <Text style={styles.modalSubtitle}>Da:</Text>
            {balances.map((balance) => (
              <TouchableOpacity
                key={`from-${balance.id}`}
                style={[
                  styles.modalBalanceButton,
                  fromBalanceId === balance.id &&
                    styles.modalBalanceButtonSelected,
                ]}
                onPress={() => setFromBalanceId(balance.id)}
              >
                <Text style={styles.modalBalanceButtonText}>
                  {balance.name} ({balance.amount.toFixed(2)} €)
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.modalSubtitle}>A:</Text>
            {balances.map((balance) => (
              <TouchableOpacity
                key={`to-${balance.id}`}
                style={[
                  styles.modalBalanceButton,
                  toBalanceId === balance.id &&
                    styles.modalBalanceButtonSelected,
                ]}
                onPress={() => setToBalanceId(balance.id)}
              >
                <Text style={styles.modalBalanceButtonText}>
                  {balance.name} ({balance.amount.toFixed(2)} €)
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setTransferModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Annulla</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={transferFunds}
              >
                <Text style={styles.modalButtonText}>Conferma</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal per aggiungere una spesa extra */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={extraModalVisible}
        onRequestClose={() => setExtraModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Descrizione Spesa Extra</Text>

            <TextInput
              style={styles.input}
              placeholder="Aggiungi descrizione"
              placeholderTextColor="#ccc"
              value={extraDescription}
              onChangeText={setExtraDescription}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setExtraModalVisible(false)
                  setExtraDescription('')
                }}
              >
                <Text style={styles.modalButtonText}>Annulla</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={async () => {
                  setExtraModalVisible(false)
                  await saveExpense()
                  setExtraDescription('')
                }}
              >
                <Text style={styles.modalButtonText}>Conferma</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal per modificare nome saldo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifica nome saldo</Text>
            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Nuovo nome"
              placeholderTextColor="#ccc"
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={saveEditedBalance}
              >
                <Text style={styles.modalButtonText}>Salva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  initialBalanceContainer: {
    marginTop: '50%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialBalanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  input: {
    width: 200,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  balanceText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },

  container: {
    flex: 1,
    backgroundColor: '#1e2b18',
    padding: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  total: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 15,
    fontFamily: 'Roboto',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2e3d25',
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 3,
  },
  label: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  percent: {
    color: '#ccc',
    fontSize: 15,
  },
  amount: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balance: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  balanceSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  balanceButton: {
    backgroundColor: '#2e3d25',
    padding: 10,
    margin: 5,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedBalanceButton: {
    backgroundColor: '#3f51b5',
    borderWidth: 2,
    borderColor: '#fff',
  },
  balanceButtonText: {
    color: 'white',
    fontSize: 14,
  },
  transferButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  transferButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addBalanceContainer: {
    marginBottom: 20,
  },
  addBalanceButton: {
    backgroundColor: '#3f51b5',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  addBalanceButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#2e3d25',
    padding: 14,
    borderRadius: 10,
    color: 'white',
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  categoryBtn: {
    width: '22%',
    backgroundColor: '#444',
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  categoryText: {
    flex: 1,
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  categoryText2: {
    flex: 1,
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: '#3f51b5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pieChart: {
    marginBottom: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#1e2b18',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalSubtitle: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  modalBalanceButton: {
    backgroundColor: '#2e3d25',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  modalBalanceButtonSelected: {
    backgroundColor: '#3f51b5',
    borderWidth: 1,
    borderColor: 'white',
  },
  modalBalanceButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  confirmButton: {
    backgroundColor: '#4caf50',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  balanceActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
