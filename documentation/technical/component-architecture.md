# Component Architecture

## Overview

TBDC Horizon uses a modular component architecture built with React Native and TypeScript. Components are designed for reusability, maintainability, and consistent user experience across the application.

## Component Hierarchy

### Root Level Components

#### 1. **RootLayout** (`app/_layout.tsx`)
**Purpose**: Main application wrapper with providers and navigation setup

```typescript
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ConnectionsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="connection-details" />
            <Stack.Screen name="session-details" />
            <Stack.Screen name="meeting-details" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ConnectionsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
```

**Responsibilities**:
- Provider setup (Auth, Connections)
- Navigation configuration
- Status bar management
- Gesture handling setup

#### 2. **TabLayout** (`app/(tabs)/_layout.tsx`)
**Purpose**: Bottom tab navigation configuration

```typescript
export default function TabLayout() {
  const { user } = useAuth();
  
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="sessions" options={{ title: 'Sessions' }} />
      <Tabs.Screen name="meetings" options={{ title: 'Meetings' }} />
      <Tabs.Screen name="connections" options={{ title: 'Connections' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

## Core UI Components

### 1. **SessionCard** (`components/SessionCard.tsx`)

**Purpose**: Displays session information in a card format

```typescript
interface SessionCardProps {
  session: Session;
  onPress: () => void;
  fullWidth?: boolean;
}

export function SessionCard({ session, onPress, fullWidth = false }: SessionCardProps) {
  const typeColor = getTypeColor(session.type);
  
  return (
    <Pressable style={[styles.card, fullWidth && styles.fullWidth]} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{session.name}</Text>
        <View style={[styles.typeTag, { backgroundColor: typeColor.bg }]}>
          <Text style={[styles.typeText, { color: typeColor.text }]}>{session.type}</Text>
        </View>
      </View>
      <View style={styles.details}>
        {/* Session details with icons */}
      </View>
      <Text style={styles.description}>{session.description}</Text>
    </Pressable>
  );
}
```

**Features**:
- Dynamic color coding for session types
- Responsive layout with fullWidth option
- Touch feedback and press handling
- Icon-based detail display

### 2. **MeetingCard** (`components/MeetingCard.tsx`)

**Purpose**: Displays meeting information in a card format

```typescript
interface MeetingCardProps {
  meeting: Meeting;
  onPress: () => void;
  fullWidth?: boolean;
}

export function MeetingCard({ meeting, onPress, fullWidth = false }: MeetingCardProps) {
  return (
    <Pressable style={[styles.card, fullWidth && styles.fullWidth]} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{meeting.title}</Text>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{meeting.type}</Text>
        </View>
      </View>
      <View style={styles.details}>
        {/* Meeting details with icons */}
      </View>
      <Text style={styles.description}>{meeting.description}</Text>
    </Pressable>
  );
}
```

### 3. **ConnectionCard** (`components/ConnectionCard.tsx`)

**Purpose**: Displays connection information in a card format

```typescript
interface ConnectionCardProps {
  connection: Connection;
  onPress: () => void;
  onFavoritePress: () => void;
  isFavorite: boolean;
}

export function ConnectionCard({ connection, onPress, onFavoritePress, isFavorite }: ConnectionCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {connection.profileImage ? (
            <Image source={{ uri: connection.profileImage }} style={styles.avatarImage} />
          ) : (
            <User size={24} color="#666" />
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{connection.firstName} {connection.lastName}</Text>
          <Text style={styles.role}>{connection.role}</Text>
          <Text style={styles.organization}>{connection.organization}</Text>
        </View>
        <TouchableOpacity onPress={onFavoritePress}>
          <Heart size={20} color={isFavorite ? "#d32f2f" : "#ccc"} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}
```

### 4. **FilterBar** (`components/FilterBar.tsx`)

**Purpose**: Provides filtering functionality for lists

```typescript
interface FilterBarProps {
  filters: string[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterBar({ filters, selectedFilter, onFilterChange }: FilterBarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            selectedFilter === filter && styles.selectedFilter
          ]}
          onPress={() => onFilterChange(filter)}
        >
          <Text style={[
            styles.filterText,
            selectedFilter === filter && styles.selectedFilterText
          ]}>
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
```

## Screen Components

### 1. **HomeScreen** (`app/(tabs)/home.tsx`)

**Purpose**: Main dashboard with featured content

```typescript
export default function HomeScreen() {
  const [featuredSessions, setFeaturedSessions] = useState<Session[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (user?.cohort) {
      const sessions = await fetchSessions(user.cohort);
      const upcoming = sessions
        .filter(s => new Date(s.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      setFeaturedSessions(upcoming);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning, {user?.firstName}!</Text>
      </View>
      <ScrollView>
        {/* Featured Sessions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Sessions</Text>
          <ScrollView horizontal>
            {featuredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => router.push(`/session-details?sessionId=${session.id}`)}
                fullWidth
              />
            ))}
          </ScrollView>
        </View>
        {/* Upcoming Meetings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
          <ScrollView horizontal>
            {upcomingMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onPress={() => router.push(`/meeting-details?meetingId=${meeting.id}`)}
                fullWidth
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### 2. **ProfileScreen** (`app/(tabs)/profile.tsx`)

**Purpose**: User profile and administrative functions

```typescript
export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <User size={40} color="#000" />
          </View>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          {user?.role === 'Admin' && (
            <View style={styles.roleTag}>
              <Shield size={16} color="#fff" />
              <Text style={styles.roleText}>Administrator</Text>
            </View>
          )}
        </View>
        
        {/* Actions Section */}
        <View style={styles.actionsSection}>
          {user?.role === 'Admin' && (
            <TouchableOpacity onPress={() => setAdminModalVisible(true)}>
              <Shield size={20} color="#1976d2" />
              <Text>Admin Portal</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleLogout}>
            <LogOut size={20} color="#d32f2f" />
            <Text>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Admin Modal */}
      <Modal visible={adminModalVisible} animationType="slide">
        <AdminPortal onClose={() => setAdminModalVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}
```

## Component Design Patterns

### 1. **Container/Presentational Pattern**

```typescript
// Container Component
function SessionsContainer() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    if (user?.cohort) {
      const data = await fetchSessions(user.cohort);
      setSessions(data);
    }
    setLoading(false);
  };

  return <SessionsList sessions={sessions} loading={loading} />;
}

// Presentational Component
function SessionsList({ sessions, loading }: { sessions: Session[], loading: boolean }) {
  if (loading) return <LoadingSpinner />;
  
  return (
    <FlatList
      data={sessions}
      renderItem={({ item }) => <SessionCard session={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### 2. **Compound Component Pattern**

```typescript
// Compound Component
const Card = {
  Container: ({ children, style }: { children: React.ReactNode, style?: any }) => (
    <View style={[styles.card, style]}>{children}</View>
  ),
  Header: ({ children }: { children: React.ReactNode }) => (
    <View style={styles.header}>{children}</View>
  ),
  Title: ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.title}>{children}</Text>
  ),
  Content: ({ children }: { children: React.ReactNode }) => (
    <View style={styles.content}>{children}</View>
  ),
};

// Usage
<Card.Container>
  <Card.Header>
    <Card.Title>Session Title</Card.Title>
  </Card.Header>
  <Card.Content>
    <Text>Session description</Text>
  </Card.Content>
</Card.Container>
```

### 3. **Render Props Pattern**

```typescript
interface DataFetcherProps<T> {
  fetchFunction: () => Promise<T[]>;
  children: (data: T[], loading: boolean, error: string | null) => React.ReactNode;
}

function DataFetcher<T>({ fetchFunction, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFunction()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [fetchFunction]);

  return <>{children(data, loading, error)}</>;
}

// Usage
<DataFetcher fetchFunction={() => fetchSessions(user.cohort)}>
  {(sessions, loading, error) => (
    loading ? <LoadingSpinner /> : <SessionsList sessions={sessions} />
  )}
</DataFetcher>
```

## Styling Architecture

### 1. **StyleSheet Organization**

```typescript
const styles = StyleSheet.create({
  // Layout styles
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  // Typography styles
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  
  // Component-specific styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

### 2. **Theme System**

```typescript
const theme = {
  colors: {
    primary: '#1976d2',
    secondary: '#cd9d5a',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: 'bold' },
    h3: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 16 },
    caption: { fontSize: 14, color: '#666' },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};
```

## Performance Optimization

### 1. **Memoization**

```typescript
const SessionCard = React.memo(({ session, onPress }: SessionCardProps) => {
  const typeColor = useMemo(() => getTypeColor(session.type), [session.type]);
  
  return (
    <Pressable onPress={onPress}>
      {/* Card content */}
    </Pressable>
  );
});
```

### 2. **Lazy Loading**

```typescript
const LazyModal = React.lazy(() => import('./Modal'));

function ComponentWithModal() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyModal />
    </Suspense>
  );
}
```

### 3. **FlatList Optimization**

```typescript
const SessionsList = React.memo(({ sessions }: { sessions: Session[] }) => {
  const renderItem = useCallback(({ item }: { item: Session }) => (
    <SessionCard session={item} />
  ), []);

  const keyExtractor = useCallback((item: Session) => item.id, []);

  return (
    <FlatList
      data={sessions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
});
```

## Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <TouchableOpacity onPress={() => this.setState({ hasError: false })}>
            <Text>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

## Testing Strategy

### 1. **Component Testing**

```typescript
import { render, fireEvent } from '@testing-library/react-native';

describe('SessionCard', () => {
  it('renders session information correctly', () => {
    const session = {
      id: '1',
      name: 'Test Session',
      type: 'Workshop',
      date: new Date(),
      duration: 60,
      location: 'Test Location',
      description: 'Test Description',
    };

    const { getByText } = render(<SessionCard session={session} onPress={() => {}} />);
    
    expect(getByText('Test Session')).toBeTruthy();
    expect(getByText('Workshop')).toBeTruthy();
    expect(getByText('Test Location')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const session = { /* test session */ };

    const { getByTestId } = render(<SessionCard session={session} onPress={onPress} />);
    
    fireEvent.press(getByTestId('session-card'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### 2. **Integration Testing**

```typescript
describe('SessionsScreen', () => {
  it('loads and displays sessions', async () => {
    const mockSessions = [/* test sessions */];
    jest.spyOn(dataService, 'fetchSessions').mockResolvedValue(mockSessions);

    const { findByText } = render(<SessionsScreen />);
    
    await findByText('Test Session');
    expect(dataService.fetchSessions).toHaveBeenCalled();
  });
});
``` 