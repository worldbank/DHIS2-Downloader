import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoading: false,
  errorMessage: '',
  notification: {
    message: '',
    type: ''
  }
}

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.errorMessage = action.payload
    },
    setNotification: (state, action) => {
      state.notification = action.payload
    },
    handleExit: (state) => {
      return initialState
    }
  }
})

export const { setLoading, setError, setNotification, handleExit } = statusSlice.actions
export default statusSlice.reducer
