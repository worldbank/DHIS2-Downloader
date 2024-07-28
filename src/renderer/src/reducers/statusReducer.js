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
      state.notification = { ...state.notification, ...action.payload }
    },
    abortDownload: (state) => {
      state.isLoading = false
      state.notification.message = 'Download aborted'
      state.notification.type = 'info'
    },
    handleExit: (state) => {
      return initialState
    }
  }
})

export const { setLoading, setError, setNotification, abortDownload, handleExit } =
  statusSlice.actions
export default statusSlice.reducer
