import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { User as UserType, Report } from '@/types';
import { Building, Mail, LogOut, CreditCard as Edit, Shield, Plus, X, User, FileText, Download, Calendar, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { authService } from '@/services/authService';
import { fetchReports } from '@/services/dataService';
import { ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [reportsModalVisible, setReportsModalVisible] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteCompanyName, setInviteCompanyName] = useState('');
  const [inviteCompanyUID, setInviteCompanyUID] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'User'>('Admin');
  const [inviteCohort, setInviteCohort] = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [userInfoModalVisible, setUserInfoModalVisible] = useState(false);
  const [editUserModalVisible, setEditUserModalVisible] = useState(false);
  const [editUserRole, setEditUserRole] = useState<'Admin' | 'User'>('User');
  const [editUserFirstName, setEditUserFirstName] = useState('');
  const [editUserLastName, setEditUserLastName] = useState('');
  const [editUserCompanyName, setEditUserCompanyName] = useState('');
  const [editUserCompanyUID, setEditUserCompanyUID] = useState('');
  const [editUserCohort, setEditUserCohort] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user?.role === 'Admin' && adminModalVisible) {
      (async () => {
        const users = await authService.getAllUsers();
        setUsers(users);
      })();
    }
  }, [user, adminModalVisible]);

  useEffect(() => {
    if (reportsModalVisible && user) {
      fetchReports(user.companyUID).then(setReports).catch(() => setReports([]));
    }
  }, [reportsModalVisible, user]);

  const loadReports = () => {
    if (!user) return;
    fetchReports(user.companyUID)
      .then(setReports)
      .catch(() => setReports([]));
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      // In a real app, this would download the PDF
      // For demo purposes, we'll just show an alert and open a stub URL
      Alert.alert(
        'Download Report',
        `Downloading: ${report.title}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open', 
            onPress: () => {
              // Open a stub PDF URL
              Linking.openURL('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to download report');
    }
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderReportCard = ({ item }: { item: Report }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportIcon}>
          <FileText size={24} color="#1976d2" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>{item.title}</Text>
          <View style={styles.reportMeta}>
            <View style={styles.reportMetaRow}>
              <Calendar size={14} color="#000" />
              <Text style={styles.reportMetaText}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.reportTypeTag}>
              <Text style={styles.reportTypeText}>{item.type}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.reportDownloadButton}
        onPress={() => handleDownloadReport(item)}
      >
        <Download size={20} color="#fff" />
        <Text style={styles.reportDownloadText}>Download PDF</Text>
      </TouchableOpacity>
    </View>
  );


  const handleInviteAdmin = async () => {
    if (!inviteFirstName.trim() || !inviteLastName.trim() || !inviteCompanyName.trim() || !inviteCompanyUID.trim() || !inviteEmail.trim() || !invitePassword.trim() || !inviteRole) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await authService.signup({
        firstName: inviteFirstName,
        lastName: inviteLastName,
        companyName: inviteCompanyName,
        companyUID: inviteCompanyUID,
        email: inviteEmail,
        password: invitePassword,
        role: inviteRole,
        cohort: inviteCohort,
      });
      Alert.alert('Success', 'User invited successfully');
      setInviteFirstName('');
      setInviteLastName('');
      setInviteCompanyName('');
      setInviteCompanyUID('');
      setInviteEmail('');
      setInvitePassword('');
      setInviteRole('Admin');
      setInviteCohort('');
      setInviteModalVisible(false); // Only close modal on success
      // Refresh user list
      if (user?.role === 'Admin') {
        const users = await authService.getAllUsers();
        setUsers(users);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to invite user');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality would be implemented here');
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container]}> 
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ backgroundColor: '#f5f7fa' }}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <User size={40} color="#000" />
          </View>
          
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          {user.role === 'Admin' && (
            <View style={styles.roleTag}>
              <Shield size={16} color="#fff" />
              <Text style={styles.roleText}>Administrator</Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Mail size={20} color="#000" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Building size={20} color="#000" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Company</Text>
                <Text style={styles.infoValue}>{user.companyName}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Building size={20} color="#000" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Company ID</Text>
                <Text style={styles.infoValue}>{user.companyUID}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setReportsModalVisible(true)}>
            <FileText size={20} color="#1976d2" />
            <Text style={styles.actionText}>View Reports</Text>
          </TouchableOpacity>
          {user.role === 'Admin' && (
            <TouchableOpacity style={styles.actionButton} onPress={() => setAdminModalVisible(true)}>
              <Shield size={20} color="#1976d2" />
              <Text style={styles.actionText}>Admin Portal</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]} 
            onPress={handleLogout}
          >
            <LogOut size={20} color="#d32f2f" />
            <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Remove the footer with 'Member since' */}
      </ScrollView>
      {/* Admin Portal Modal */}
      <Modal
        visible={adminModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAdminModalVisible(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView style={styles.container}>
            <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }]}> 
              <Text style={styles.title}>Admin Panel</Text>
              <TouchableOpacity style={{ position: 'absolute', right: 20, top: 20, padding: 4, zIndex: 10 }} onPress={() => setAdminModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.actionsBar}>
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => {
                  setInviteFirstName('');
                  setInviteLastName('');
                  setInviteCompanyName('');
                  setInviteCompanyUID('');
                  setInviteEmail('');
                  setInvitePassword('');
                  setInviteRole('User'); // default to User
                  setInviteCohort('');
                  setAdminModalVisible(false); // Close admin modal when opening invite modal
                  setInviteModalVisible(true);
                }}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.inviteButtonText}>Create User</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedUser(item);
                    setUserInfoModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.userCard}>
                    <View style={styles.userHeader}>
                      <View style={styles.userAvatar}>
                        <User size={24} color="#000" />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.modalUserName}>{item.firstName} {item.lastName}</Text>
                        <Text style={styles.modalUserEmail}>{item.email}</Text>
                        <View style={styles.userMeta}>
                          <Building size={14} color="#000" />
                          <Text style={styles.userCompany}>{item.companyName}</Text>
                        </View>
                      </View>
                      <View style={styles.userRole}>
                        {item.role === 'Admin' ? (
                          <View style={styles.adminTag}>
                            <Shield size={14} color="#fff" />
                            <Text style={styles.adminText}>Admin</Text>
                          </View>
                        ) : (
                          <View style={styles.userTag}>
                            <Text style={styles.userText}>User</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.detailText}>Company ID: {item.companyUID}</Text>
                      <Text style={styles.detailText}>Joined: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
            {/* Invite Modal is now a true Modal rendered outside the admin modal */}
          </SafeAreaView>
        </GestureHandlerRootView>
      </Modal>
      {/* Reports Modal */}
      <Modal
        visible={reportsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setReportsModalVisible(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView style={styles.container}>
            <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.title}>Reports</Text>
              </View>
              <TouchableOpacity style={{ position: 'absolute', right: 20, top: 20, padding: 4 }} onPress={() => setReportsModalVisible(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={reports}
              keyExtractor={(item) => item.id}
              renderItem={renderReportCard}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </SafeAreaView>
        </GestureHandlerRootView>
      </Modal>
      {/* Invite Modal is now a true Modal rendered outside the admin modal */}
      <Modal
        visible={inviteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setInviteModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ width: '100%', alignItems: 'center' }}
              >
                <View style={styles.modalContainer}>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Create User</Text>
                  </View>
                  {/* Form */}
                  <View style={styles.form}>
                    <TextInput style={styles.input} placeholder="First Name" value={inviteFirstName} onChangeText={setInviteFirstName} placeholderTextColor="#888" />
                    <TextInput style={styles.input} placeholder="Last Name" value={inviteLastName} onChangeText={setInviteLastName} placeholderTextColor="#888" />
                    <TextInput style={styles.input} placeholder="Company Name" value={inviteCompanyName} onChangeText={setInviteCompanyName} placeholderTextColor="#888" />
                    <TextInput style={styles.input} placeholder="Company UID" value={inviteCompanyUID} onChangeText={setInviteCompanyUID} placeholderTextColor="#888" />
                    <TextInput style={styles.input} placeholder="Cohort" value={inviteCohort} onChangeText={setInviteCohort} placeholderTextColor="#888" />
                    <TextInput style={styles.input} placeholder="Email" value={inviteEmail} onChangeText={setInviteEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholderTextColor="#888" />
                    <TextInput style={styles.input} placeholder="Password" value={invitePassword} onChangeText={setInvitePassword} secureTextEntry placeholderTextColor="#888" />
                    <View style={{ flexDirection: 'row', marginBottom: 15, width: '100%', justifyContent: 'space-between' }}>
                      <TouchableOpacity style={[styles.sendButton, { flex: 1, marginRight: 5, backgroundColor: inviteRole === 'Admin' ? '#1976d2' : '#e0e0e0' }]} onPress={() => setInviteRole('Admin')}>
                        <Text style={[styles.sendButtonText, { color: inviteRole === 'Admin' ? '#fff' : '#666' }]}>Admin</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.sendButton, { flex: 1, marginLeft: 5, backgroundColor: inviteRole === 'User' ? '#1976d2' : '#e0e0e0' }]} onPress={() => setInviteRole('User')}>
                        <Text style={[styles.sendButtonText, { color: inviteRole === 'User' ? '#fff' : '#666' }]}>User</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* Footer Actions */}
                  <View style={styles.modalFooter}>
                    <TouchableOpacity style={[styles.cancelButton, styles.footerButton]} onPress={() => setInviteModalVisible(false)}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.createButton, styles.footerButton]} onPress={handleInviteAdmin}>
                      <Text style={styles.createText}>Create</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* User Info Modal */}
      <Modal
        visible={userInfoModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUserInfoModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setUserInfoModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>User Info</Text>
                  {selectedUser && (
                    <TouchableOpacity
                      onPress={() => {
                        setEditUserRole(selectedUser.role === 'Admin' ? 'Admin' : 'User');
                        setEditUserFirstName(selectedUser.firstName);
                        setEditUserLastName(selectedUser.lastName);
                        setEditUserCompanyName(selectedUser.companyName);
                        setEditUserCompanyUID(selectedUser.companyUID);
                        setEditUserCohort(selectedUser.cohort || '');
                        setEditUserModalVisible(true);
                      }}
                      style={styles.editButton}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {selectedUser && (
                  <View>
                    <Text style={styles.detailText}>Name: {selectedUser.firstName} {selectedUser.lastName}</Text>
                    <Text style={styles.detailText}>Email: {selectedUser.email}</Text>
                    <Text style={styles.detailText}>Company: {selectedUser.companyName}</Text>
                    <Text style={styles.detailText}>Company ID: {selectedUser.companyUID}</Text>
                    <Text style={styles.detailText}>Role: {selectedUser.role}</Text>
                    <Text style={styles.detailText}>Cohort: {selectedUser.cohort}</Text>
                    <Text style={styles.detailText}>Joined: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Edit User Modal */}
      <Modal
        visible={editUserModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditUserModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setEditUserModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit User</Text>
                  {selectedUser && (
                    <TouchableOpacity
                      onPress={async () => {
                        Alert.alert(
                          'Delete User',
                          'Are you sure you want to delete this user?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: async () => {
                                await authService.deleteUser(selectedUser.id);
                                setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
                                setEditUserModalVisible(false);
                                setUserInfoModalVisible(false);
                              },
                            },
                          ]
                        );
                      }}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={22} color="#d32f2f" />
                    </TouchableOpacity>
                  )}
                </View>
                {selectedUser && (
                  <View style={styles.form}>
                    <TextInput style={styles.input} placeholder="First Name" value={editUserFirstName} onChangeText={setEditUserFirstName} placeholderTextColor="#888" />
                    <TextInput style={styles.input} placeholder="Last Name" value={editUserLastName} onChangeText={setEditUserLastName} placeholderTextColor="#888" />
                    <TextInput style={styles.input} placeholder="Company Name" value={editUserCompanyName} onChangeText={setEditUserCompanyName} placeholderTextColor="#888" />
                    <TextInput style={styles.input} placeholder="Company UID" value={editUserCompanyUID} onChangeText={setEditUserCompanyUID} placeholderTextColor="#888" />
                    <TextInput style={styles.input} placeholder="Cohort" value={editUserCohort} onChangeText={setEditUserCohort} placeholderTextColor="#888" />
                    <Text style={styles.detailText}>Email: {selectedUser.email}</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 15, width: '100%', justifyContent: 'space-between' }}>
                      <TouchableOpacity style={[styles.sendButton, { flex: 1, marginRight: 5, backgroundColor: editUserRole === 'Admin' ? '#1976d2' : '#e0e0e0' }]} onPress={() => setEditUserRole('Admin')}>
                        <Text style={[styles.sendButtonText, { color: editUserRole === 'Admin' ? '#fff' : '#666' }]}>Admin</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.sendButton, { flex: 1, marginLeft: 5, backgroundColor: editUserRole === 'User' ? '#1976d2' : '#e0e0e0' }]} onPress={() => setEditUserRole('User')}>
                        <Text style={[styles.sendButtonText, { color: editUserRole === 'User' ? '#fff' : '#666' }]}>User</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                <View style={styles.modalFooter}>
                  <TouchableOpacity style={[styles.cancelButton, styles.footerButton]} onPress={() => setEditUserModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.createButton, styles.footerButton]} onPress={async () => {
                    if (selectedUser) {
                      await authService.updateUserInfo(selectedUser.id, {
                        firstName: editUserFirstName,
                        lastName: editUserLastName,
                        companyName: editUserCompanyName,
                        companyUID: editUserCompanyUID,
                        cohort: editUserCohort,
                        role: editUserRole,
                      });
                      // Update user in list
                      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, firstName: editUserFirstName, lastName: editUserLastName, companyName: editUserCompanyName, companyUID: editUserCompanyUID, cohort: editUserCohort, role: editUserRole } : u));
                      setSelectedUser(prev => prev ? { ...prev, firstName: editUserFirstName, lastName: editUserLastName, companyName: editUserCompanyName, companyUID: editUserCompanyUID, cohort: editUserCohort, role: editUserRole } : prev);
                    }
                    setEditUserModalVisible(false);
                  }}>
                    <Text style={styles.createText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa', // grey background
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  actionsSection: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#ffebee',
    backgroundColor: '#ffebee',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1976d2',
    marginLeft: 12,
  },
  logoutText: {
    color: '#d32f2f',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
  // New styles for Admin Portal Modal
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalUserEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userCompany: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  userRole: {
    marginLeft: 10,
  },
  adminTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  userTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userText: {
    fontSize: 12,
    color: '#666',
  },
  userDetails: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  listContent: {
    padding: 20,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 32, // Add space below the header
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inviteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 0, // ensure no extra margin
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#1a1a1a',
  },
  sendButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#1976d2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  closeModalButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
  // New styles for Reports Modal
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  reportMetaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  reportTypeTag: {
    backgroundColor: '#e0f2f7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportTypeText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  reportDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  reportDownloadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 320,
    maxWidth: 400,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  closeButton: {
    padding: 8,
  },
  form: {
    marginBottom: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 12, // for spacing between buttons (if supported)
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  removeText: {
    color: '#888',
    marginLeft: 6,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#d32f2f',
    marginRight: 6, // fallback spacing if gap is not supported
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginLeft: 6, // fallback spacing if gap is not supported
  },
  createText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
    marginLeft: 'auto',
  },
  editButtonText: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    alignItems: 'center', // ensure vertical alignment
    justifyContent: 'center',
  },
});