const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';

export interface Station {
  _id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  stockLevel: number;
  pricePerKg: number;
  operatingHours?: string;
  lastUpdated?: string;
  pumpStatus?: string;
  waitingTime?: number;
  bookings?: any[];
  dailySales?: any[];
}

export interface RegisterData {
  // Admin details
  name: string;
  email: string;
  password: string;
  phone?: string;
  // Bunk details
  bunkName: string;
  bunkAddress: string;
  bunkLat: number;
  bunkLng: number;
  bunkPrice: number;
  bunkOperatingHours?: string;
  // Security details
  captchaId?: string;
  captchaAnswer?: string;
}


export const adminApi = {
  // Register bunk admin + their bunk station
  async register(data: RegisterData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json(); // { message, token, user, station }
  },

  // Login — returns admin info + their own station
  async login(email: string, password: string, captchaId?: string, captchaAnswer?: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, captchaId, captchaAnswer }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return res.json(); // { message, token, user, station }
  },

  // Get Captcha
  async getCaptcha() {
    const res = await fetch(`${API_BASE_URL}/auth/captcha`);
    if (!res.ok) throw new Error('Failed to fetch Captcha');
    return res.json(); // { captchaId, question }
  },

  // Verify OTP
  async verifyOtp(email: string, otp: string) {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Verification failed');
    }
    return res.json();
  },

  // Get admin's own station
  async getMyStation(token: string): Promise<Station> {
    const res = await fetch(`${API_BASE_URL}/auth/me/station`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch your station');
    return res.json();
  },

  // Update own station stock/price
  async updateStation(
    token: string,
    stationId: string,
    data: { 
      stockLevel?: number; 
      pricePerKg?: number;
      name?: string;
      address?: string;
      lat?: number;
      lng?: number;
      operatingHours?: string;
      pumpStatus?: string;
      waitingTime?: number;
    }
  ): Promise<Station> {
    const res = await fetch(`${API_BASE_URL}/stations/${stationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update station');
    }
    const result = await res.json();
    return result.station || result;
  },

  // Update Admin Profile
  async updateMyProfile(
    token: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      newPassword?: string;
    }
  ) {
    const res = await fetch(`${API_BASE_URL}/auth/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update profile');
    }
    return res.json();
  },

  // Get all stations (public — used by customer view)
  async getAllStations(): Promise<Station[]> {
    const res = await fetch(`${API_BASE_URL}/stations`);
    if (!res.ok) throw new Error('Failed to fetch stations');
    return res.json();
  },

  // Resend OTP
  async resendOtp(email: string) {
    const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to resend OTP');
    }
    return res.json();
  },

  // Forgot Password
  async forgotPassword(email: string, captchaId?: string, captchaAnswer?: string) {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, captchaId, captchaAnswer }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send reset code');
    }
    return res.json();
  },

  // Reset Password
  async resetPassword(data: any) {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reset password');
    }
    return res.json();
  },

  async updateBookingStatus(token: string, stationId: string, bookingId: string, status: string) {
    const res = await fetch(`${API_BASE_URL}/stations/${stationId}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update booking');
    const result = await res.json();
    return result.station || result;
  },

  async addDailySales(token: string, stationId: string, date: string, amount: number, stockSold: number) {
    const res = await fetch(`${API_BASE_URL}/stations/${stationId}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ date, amount, stockSold })
    });
    if (!res.ok) throw new Error('Failed to add sales');
    const result = await res.json();
    return result.station || result;
  }
};