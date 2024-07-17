import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoading: false,
  errorMessage: '',
  notification: {
    message: '',
    type: '' // 'success', 'error', 'info', etc.
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
    clearError: (state) => {
      state.errorMessage = ''
    },
    setNotification: (state, action) => {
      state.notification.message = action.payload.message
      state.notification.type = action.payload.type
    },
    clearNotification: (state) => {
      state.notification.message = ''
      state.notification.type = ''
    },
    handleExit: (state) => {
      state.isLoading = false
      state.errorMessage = ''
      state.notification.message = ''
      state.notification.type = ''
    }
  }
})

export const { setLoading, setError, clearError, setNotification, clearNotification, handleExit } =
  statusSlice.actions

export default statusSlice.reducer
