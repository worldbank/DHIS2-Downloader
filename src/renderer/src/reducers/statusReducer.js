import { createSlice } from '@reduxjs/toolkit'
import { openModal } from './modalReducer'
import { throttle } from 'lodash'

const initialState = {
  isLoading: false,
  showLogs: false,
  notification: [],
  logs: []
}

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    addNotification: (state, action) => {
      state.notification.push(action.payload)
    },
    clearNotification: (state) => {
      state.notification = []
    },
    addLog: (state, action) => {
      state.logs.push(action.payload)
    },
    clearLogs: (state) => {
      state.logs = []
    },
    toggleNotifications: (state) => {
      state.showLogs = !state.showLogs
    },
    handleExit: (state) => {
      return initialState
    }
  }
})

const throttledDispatch = throttle((dispatch, notification) => {
  dispatch(addNotification(notification))
}, 500)

export const triggerNotification = (payload) => (dispatch) => {
  dispatch(openModal({ type: 'NOTIFICATION' }))

  throttledDispatch(dispatch, {
    message: payload.message,
    type: payload.type
  })
}

export const triggerLoading = (isLoading) => (dispatch) => {
  dispatch(setLoading(isLoading))
  if (isLoading) {
    dispatch(openModal({ type: 'NOTIFICATION' }))
  }
}

export const logActivity = (payload) => (dispatch) => {
  dispatch(addLog({ message: payload.message, type: payload.type }))
}

export const {
  setLoading,
  addNotification,
  clearNotification,
  addLog,
  clearLogs,
  toggleNotifications,
  handleExit
} = statusSlice.actions
export default statusSlice.reducer
