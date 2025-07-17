import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { User as UserType, Report } from '@/types';
import { Building, Mail, LogOut, CreditCard as Edit, Shield, Plus, X, User, FileText, Download, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { authService } from '@/services/authService';
import { dataService, fetchReports } from '@/services/dataService';
import { ScrollView, Modal, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [reportsModalVisible, setReportsModalVisible] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (user?.role === 'Admin' && adminModalVisible) {
      setUsers(authService.getAllUsers());
    }
  }, [user, adminModalVisible]);

  useEffect(() => {
    if (reportsModalVisible && user) {
      fetchReports(user.companyUID).then(setReports).catch(() => setReports([]));
    }
  }, [reportsModalVisible, user]);

  const loadReports = () => {
    const companyUID = user?.role === 'User' ? user.companyUID : undefined;
    const reportData = dataService.getReports(companyUID);
    setReports(reportData);
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
              <Calendar size={14} color="#666" />
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


  const handleInviteAdmin = () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    // In a real app, this would send an invitation email
    Alert.alert(
      'Invitation Sent',
      `Admin invitation sent to ${inviteEmail}`,
      [{ text: 'OK', onPress: () => setInviteEmail('') }]
    );
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
    <SafeAreaView style={styles.container}> 
      <StatusBar style="dark" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ backgroundColor: '#f5f7fa' }}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <User size={40} color="#666" />
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
              <Mail size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Building size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Company</Text>
                <Text style={styles.infoValue}>{user.companyName}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Building size={20} color="#666" />
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

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
            }) : 'N/A'}
          </Text>
        </View>
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
            <View style={styles.header}>
              <Text style={styles.title}>Admin Panel</Text>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setAdminModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.actionsBar}>
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => setInviteEmail('')}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.inviteButtonText}>Invite Admin</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <View style={styles.userAvatar}>
                      <User size={24} color="#666" />
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.modalUserName}>{item.firstName} {item.lastName}</Text>
                      <Text style={styles.modalUserEmail}>{item.email}</Text>
                      <View style={styles.userMeta}>
                        <Building size={14} color="#666" />
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
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
            {/* Invite Admin Modal Content */}
            {inviteEmail !== '' && (
              <View style={styles.inviteModalContent}>
                <Text style={styles.modalTitle}>Invite Administrator</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleInviteAdmin}>
                  <Text style={styles.sendButtonText}>Send Invitation</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeModalButton} onPress={() => setInviteEmail('')}>
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
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
            <View style={styles.header}>
              <Text style={styles.title}>Reports</Text>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setReportsModalVisible(false)}>
                <X size={24} color="#666" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    marginBottom: 15,
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
});