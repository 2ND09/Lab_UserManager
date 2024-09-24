import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

function App() {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [ageError, setAgeError] = useState('');

    const usersCollectionRef = collection(db, 'users');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getDocs(usersCollectionRef);
            const usersArray = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setUsers(usersArray);
        } catch (err) {
            setError('Error fetching users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const validateInputs = () => {
      let isValid = true;
      setNameError('');
      setEmailError('');
      setAgeError('');
  
      if (!name.trim()) {
          setNameError('Tên không được để trống');
          isValid = false;
      } else if (name.trim() !== name) {
          setNameError('Tên không được có dấu cách ở đầu hoặc cuối');
          isValid = false;
      } else if (/ {3,}/.test(name)) {
          setNameError('Tên không được có hơn 2 khoảng trắng liên tiếp');
          isValid = false;
      }
  
      if (!email.trim()) {
          setEmailError('Email không được để trống');
          isValid = false;
      } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
              setEmailError('Vui lòng nhập địa chỉ email hợp lệ');
              isValid = false;
          }
      }
  
      if (!age.trim()) {
          setAgeError('Tuổi không được để trống');
          isValid = false;
      } else if (isNaN(age) || parseInt(age) <= 0) {
          setAgeError('Tuổi phải là số dương');
          isValid = false;
      }
  
      return isValid;
  };

    const addUser = async () => {
        if (isSubmitting) return;
        if (!validateInputs()) return;

        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateUser(editingId);
            } else {
                await addDoc(usersCollectionRef, { name: name.trim(), email: email.trim(), age: parseInt(age) });
                setError('Người dùng đã được thêm thành công');
            }
            fetchUsers();
            clearForm();
        } catch (err) {
            setError('Lỗi thêm/cập nhật người dùng');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateUser = async (id) => {
        try {
            const userDoc = doc(db, 'users', id);
            await updateDoc(userDoc, { name: name.trim(), email: email.trim(), age: parseInt(age) });
            setError('Người dùng đã cập nhật thành công');
        } catch (err) {
            setError('Lỗi cập nhật người dùng');
            console.error(err);
        }
    };

    const deleteUser = async (id) => {
        setLoading(true);
        try {
            const userDoc = doc(db, 'users', id);
            await deleteDoc(userDoc);
            fetchUsers();
            setError('Người dùng đã được xóa thành công');
        } catch (err) {
            setError('Lỗi xóa người dùng');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setName('');
        setEmail('');
        setAge('');
        setEditingId(null);
        setNameError('');
        setEmailError('');
        setAgeError('');
    };

    const startEditing = (user) => {
        setName(user.name);
        setEmail(user.email);
        setAge(user.age.toString());
        setEditingId(user.id);
    };

    const renderItem = ({ item }) => (
        <View style={styles.userItem}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userDetails}>{item.email} - {item.age} Tuổi</Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={() => startEditing(item)}>
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => deleteUser(item.id)}>
                    <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Quản lý người dùng</Text>
            {loading && <Text style={styles.loadingText}>Loading...</Text>}
            {error !== '' && <Text style={styles.successText}>{error}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                />
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                <TextInput
                    style={styles.input}
                    placeholder="Age"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                />
                {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}
                <TouchableOpacity 
                    style={[styles.button, styles.addButton, isSubmitting && styles.disabledButton]} 
                    onPress={addUser}
                    disabled={isSubmitting}
                >
                    <Text style={styles.buttonText}>{editingId ? 'Update User' : 'Add User'}</Text>
                </TouchableOpacity>
                {editingId && (
                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={clearForm}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#333',
    },
    inputContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height:
2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        backgroundColor: '#4CAF50',
    },
    updateButton: {
        backgroundColor: '#2196F3',
        flex: 1,
        marginRight: 5,
    },
    deleteButton: {
        backgroundColor: '#F44336',
        flex: 1,
        marginLeft: 5,
    },
    cancelButton: {
        backgroundColor: '#999',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    loadingText: {
        textAlign: 'center',
        marginBottom: 10,
    },
    listContainer: {
        paddingHorizontal: 20,
    },
    userItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    userDetails: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: 160,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginBottom: 10,
  },
  successText: {
      color: 'green',
      textAlign: 'center',
      marginBottom: 10,
  },
  disabledButton: {
      opacity: 0.5,
  },
});

export default App;