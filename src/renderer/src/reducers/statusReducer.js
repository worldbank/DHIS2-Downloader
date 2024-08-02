import { createSlice } from '@reduxjs/toolkit'
import { openModal } from './modalReducer'

const initialState = {
  isLoading: false,
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

export const triggerNotification = (payload) => (dispatch) => {
  dispatch(openModal({ type: 'NOTIFICATION' }))

  dispatch(
    setNotification({
      message: payload.message,
      type: payload.type
    })
  )
}

export const triggerLoading = (isLoading) => (dispatch) => {
  dispatch(setLoading(isLoading))
  if (isLoading) {
    dispatch(openModal({ type: 'NOTIFICATION' }))
  }
}

export const { setLoading, setNotification, abortDownload, handleExit } = statusSlice.actions
export default statusSlice.reducer
