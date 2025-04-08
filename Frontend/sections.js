import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

const ProfileSelection = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Who's Watching?</Text>

      <View style={styles.profiles}>
        <TouchableOpacity style={styles.profile}>
          <Image
            source={{
              uri: 'https://i.pinimg.com/736x/64/8b/cf/648bcf9336ac4a0c5d0604f77045ec4d.jpg',
            }}
            style={styles.avatar}
          />
          <Text style={styles.profileText}>Main</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profile} onPress={() => navigation.navigate('khome')}>
          <Image source={{uri: 'https://img.freepik.com/premium-vector/happy-girl-avatar-funny-child-profile-picture-isolated-white-background_176411-3188.jpg?w=360',
            }}
            style={styles.avatar}
          />
          <Text style={styles.profileText}>Kids</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profile} onPress={() => alert('Add new profile')}>
          <View style={styles.addProfile}>
            <Ionicons name="add" size={40} color="white" />
          </View>
          <Text style={styles.profileText}>Add Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  profiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 30,
  },
  profile: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  addProfile: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  profileText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
});

export default ProfileSelection;
