import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  username: string | null;
  name: string | null;
  email: string | null;
}

const loadState = (): AuthState => {
  try {
    const serializedState = localStorage.getItem('auth');
    if (serializedState === null) {
      return {username: null,name: null,email: null};
    }
    return JSON.parse(serializedState) as AuthState;
  } catch (err) {
    return {username: null,name: null,email: null,};
  }
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{username: string;name: string;email: string;}>
    ) => {
      state.username = action.payload.username;
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
    clearCredentials: (state) => {
      state.username = null;
      state.name = null;
      state.email = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

store.subscribe(() => {
  try {
    const state = store.getState().auth;
    localStorage.setItem('auth', JSON.stringify(state));
  } catch (err) {
    console.error(err)
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
