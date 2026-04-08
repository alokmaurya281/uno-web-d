import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: UserInfo | null;
  isAdmin: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAdmin: false,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: AuthState['user']; isAdmin: boolean }>) => {
      state.user = action.payload.user;
      state.isAdmin = action.payload.isAdmin;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAdmin: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAdmin = false;
      state.loading = false;
    },
  },
});

export const { setUser, setAdmin, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
