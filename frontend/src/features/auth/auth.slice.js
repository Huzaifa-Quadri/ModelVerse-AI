import { createSlice } from "@reduxjs/toolkit";

//Slice for auth state; It will be used to manage the auth state of the user

const authSlice = createSlice({
  name: "auth", //name of the slice; Example: auth
  initialState: {
    user: null,
    token: null,
    loading: true,
    error: null,
  },

  //Reducers are functions that are used to update the state of the slice; Example: login, logout, register, etc.
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload; //payload is the data that is passed to the reducer; Example: user data
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    // clearAuth : (state) => {
    //     state.user = null;
    //     state.token = null;
    //     state.loading = false;
    // }
  },
});

export const { setUser, setLoading, setError } = authSlice.actions; //actions are functions that are used to dispatch the reducers; Example: login, logout, register, etc.
export default authSlice.reducer; //reducer is a function that is used to update the state of the slice; Example: login, logout, register, etc.
