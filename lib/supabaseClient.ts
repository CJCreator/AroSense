// Mocking the Supabase client to avoid dependency on environment variables.
// This mock simulates authentication using localStorage.

const MOCK_USERS_KEY = 'mock_supabase_users';
const MOCK_SESSION_KEY = 'mock_supabase_session';

type SupabaseUser = {
  id: string;
  email: string;
  // In a real scenario, we would store a hashed password. For this mock, plaintext is fine.
  password?: string;
  user_metadata: {
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

// --- Helper Functions ---
const getUsers = (): SupabaseUser[] => {
  try {
    const users = localStorage.getItem(MOCK_USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: SupabaseUser[]) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const getSessionFromStorage = () => {
  try {
    const session = localStorage.getItem(MOCK_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

const saveSessionToStorage = (session: any) => {
  if (session) {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(MOCK_SESSION_KEY);
  }
};

// --- Mock Implementation ---

let onAuthStateChangeListeners: ((event: string, session: any) => void)[] = [];

const mockAuth = {
  getSession: async () => {
    const session = getSessionFromStorage();
    return Promise.resolve({ data: { session }, error: null });
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    onAuthStateChangeListeners.push(callback);
    
    // Immediately invoke with current session state
    const session = getSessionFromStorage();
    callback('INITIAL_SESSION', session);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            onAuthStateChangeListeners = onAuthStateChangeListeners.filter(
              (listener) => listener !== callback
            );
          },
        },
      },
    };
  },

  signInWithPassword: async ({ email, password }: {email: string, password?: string}) => {
    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      const session = {
        access_token: `mock_token_${Date.now()}`,
        user: { ...user, aud: 'authenticated' }, // Supabase adds 'aud'
      };
      saveSessionToStorage(session);
      onAuthStateChangeListeners.forEach((listener) => listener('SIGNED_IN', session));
      return { data: { user, session }, error: null };
    } else {
      return { data: {}, error: { message: 'Invalid login credentials' } };
    }
  },

  signUp: async ({ email, password, options }: {email: string, password?: string, options?: any}) => {
    const users = getUsers();
    if (users.find((u) => u.email === email)) {
      return { data: {}, error: { message: 'User already registered' } };
    }

    const newUser: SupabaseUser = {
      id: `user_${Date.now()}`,
      email: email,
      password: password,
      user_metadata: options?.data || {},
    };

    users.push(newUser);
    saveUsers(users);

    // Automatically sign in the user after registration for this mock
    const session = {
      access_token: `mock_token_${Date.now()}`,
      user: { ...newUser, aud: 'authenticated' },
    };
    saveSessionToStorage(session);
    onAuthStateChangeListeners.forEach((listener) => listener('SIGNED_IN', session));

    return { data: { user: newUser, session }, error: null };
  },

  signOut: async () => {
    saveSessionToStorage(null);
    onAuthStateChangeListeners.forEach((listener) => listener('SIGNED_OUT', null));
    return Promise.resolve({ error: null });
  },
};

const mockSupabaseClient = {
  auth: mockAuth,
  // Add other Supabase client methods if needed (e.g., from, rpc)
  // For this app, only 'auth' is used.
};

// The original file exports `supabase`, so we do the same.
export const supabase = mockSupabaseClient;
