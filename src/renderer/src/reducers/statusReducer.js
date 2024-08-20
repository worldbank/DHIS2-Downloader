import { createSlice } from '@reduxjs/toolkit'
import { openModal } from './modalReducer'
import { throttle } from 'lodash'

const initialState = {
  isLoading: false,
  showNotifications: false,
  notification: []
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
    toggleNotifications: (state) => {
      state.showNotifications = !state.showNotifications
    },
    handleExit: (state) => {
      return initialState
    }
  }
})

const throttledDispatch = throttle((dispatch, notification) => {
  dispatch(addNotification(notification))
}, 500) // Throttle interval is 500 ms

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

export const { setLoading, addNotification, clearNotification, toggleNotifications, handleExit } =
  statusSlice.actions
export default statusSlice.reducer
