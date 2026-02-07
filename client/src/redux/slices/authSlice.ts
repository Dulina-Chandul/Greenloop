import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "user" | "seller" | "collector";

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  verified: boolean;
  accountType?: string;
  createdAt: string;
  updatedAt: string;
  rating?: {
    average: number;
    totalReviews: number;
  };
  currency?: string;
}

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{
        user: User;
        role: UserRole;
      }>,
    ) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setAuth, clearAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;

//* Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.role;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectIsSeller = (state: { auth: AuthState }) =>
  state.auth.role === "seller";
export const selectIsCollector = (state: { auth: AuthState }) =>
  state.auth.role === "collector";
