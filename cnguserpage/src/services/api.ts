const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5004/api';

// Helper to check if API is available
const isAPIAvailable = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

// Fallback: Store users in localStorage when API is unavailable
const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem('cng_users');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const storeUser = (email: string, name: string, password: string, phone: string = '', vehicleName: string = '', vehicleType: string = '', vehicleNumber: string = '', joinDate: string = '') => {
  const users = getStoredUsers();
  users[email] = {
    name,
    email,
    password,
    phone,
    location: 'Coimbatore, Tamil Nadu',
    joinDate: joinDate || new Date().toISOString(),
    vehicle: {
      name: vehicleName,
      type: vehicleType,
      number: vehicleNumber,
    },
  };
  localStorage.setItem('cng_users', JSON.stringify(users));
};

export const api = {
  // Auth endpoints
  register: async (name: string, email: string, password: string, phone?: string, vehicleName?: string, vehicleType?: string, vehicleNumber?: string, captchaId?: string, captchaAnswer?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone: phone || '', vehicleName: vehicleName || '', vehicleType: vehicleType || '', vehicleNumber: vehicleNumber || '', captchaId, captchaAnswer }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      return response.json();
    } catch (error) {
      // Fallback: use localStorage if API unavailable
      console.warn('API unavailable, using localStorage fallback', error);
      const users = getStoredUsers();
      if (users[email]) {
        throw new Error('User already exists with this email');
      }
      const joinDate = new Date().toISOString();
      storeUser(email, name, password, phone || '', vehicleName || '', vehicleType || '', vehicleNumber || '', joinDate);
      return {
        message: 'User registered successfully (offline mode)',
        token: 'offline_' + Date.now(),
        user: { id: 'offline', name, email, phone: phone || '', joinDate, vehicle: { name: vehicleName || '', type: vehicleType || '', number: vehicleNumber || '' } },
      };
    }
  },

  login: async (email: string, password: string, captchaId?: string, captchaAnswer?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaId, captchaAnswer }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      return response.json();
    } catch (error) {
      // Fallback: use localStorage if API unavailable
      console.warn('API unavailable, using localStorage fallback', error);
      const users = getStoredUsers();
      const user = users[email];
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password');
      }
      return {
        message: 'Login successful (offline mode)',
        token: 'offline_' + Date.now(),
        user: { id: 'offline', name: user.name, email: user.email },
      };
    }
  },

  getMe: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    } catch (error) {
      // Offline fallback: return basic user info
      console.warn('API unavailable for getMe, returning offline user', error);
      throw error; // Still throw to trigger offline handling
    }
  },

  // User endpoints
  getProfile: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    } catch (error) {
      // Offline fallback: return user from localStorage
      console.warn('API unavailable for getProfile, using localStorage fallback', error);
      const offlineEmail = localStorage.getItem('cng_offline_email');
      if (offlineEmail) {
        const users = getStoredUsers();
        const user = users[offlineEmail];
        if (user) {
          return {
            _id: 'offline',
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            location: user.location || 'Coimbatore, Tamil Nadu',
            joinDate: user.joinDate || new Date().toISOString(),
            vehicle: user.vehicle || { name: '', type: '', number: '' },
          };
        }
      }
      throw error;
    }
  },

  updateProfile: async (token: string, data: { name?: string; phone?: string; location?: string; vehicleName?: string; vehicleType?: string; vehicleNumber?: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    } catch (error) {
      // Offline fallback: save to localStorage
      console.warn('API unavailable for updateProfile, using localStorage fallback', error);
      const offlineEmail = localStorage.getItem('cng_offline_email');
      if (offlineEmail) {
        const users = getStoredUsers();
        if (users[offlineEmail]) {
          users[offlineEmail] = { ...users[offlineEmail], ...data };
          localStorage.setItem('cng_users', JSON.stringify(users));
          return {
            message: 'Profile updated successfully (offline)',
            user: users[offlineEmail],
          };
        }
      }
      throw error;
    }
  },

  updateSettings: async (token: string, settings: any) => {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ settings }),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  },

  addFavorite: async (token: string, stationId: string, stationName: string) => {
    const response = await fetch(`${API_BASE_URL}/users/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stationId, stationName }),
    });
    if (!response.ok) throw new Error('Failed to add favorite');
    return response.json();
  },

  removeFavorite: async (token: string, stationId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/favorites/${stationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to remove favorite');
    return response.json();
  },

  // Station endpoints
  getAllStations: async () => {
    const response = await fetch(`${API_BASE_URL}/stations`);
    if (!response.ok) throw new Error('Failed to fetch stations');
    return response.json();
  },

  getStationById: async (stationId: string) => {
    const response = await fetch(`${API_BASE_URL}/stations/${stationId}`);
    if (!response.ok) throw new Error('Failed to fetch station');
    return response.json();
  },

  createStation: async (token: string, stationData: any) => {
    const response = await fetch(`${API_BASE_URL}/stations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(stationData),
    });
    if (!response.ok) throw new Error('Failed to create station');
    return response.json();
  },

  updateStation: async (token: string, stationId: string, data: { stockLevel?: number; pricePerKg?: number }) => {
    const response = await fetch(`${API_BASE_URL}/stations/${stationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update station');
    return response.json();
  },

  deleteStation: async (token: string, stationId: string) => {
    const response = await fetch(`${API_BASE_URL}/stations/${stationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete station');
    return response.json();
  },

  submitFeedback: async (feedbackData: { name: string; email: string; subject: string; message: string }) => {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit feedback');
    }
    return response.json();
  },

  bookSlot: async (token: string, stationId: string, bookingData: { driverName: string; driverEmail: string; vehicleNumber: string; timeSlot: string; requestedGas: number }) => {
    const response = await fetch(`${API_BASE_URL}/stations/${stationId}/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Booking failed');
    }
    return response.json();
  },
};
