import { createSlice } from '@reduxjs/toolkit'
import { openModal } from './modalReducer'

const initialState = {
  isLoading: false,
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
    handleExit: (state) => {
      return initialState
    }
  }
})

export const triggerNotification = (payload) => (dispatch) => {
  dispatch(openModal({ type: 'NOTIFICATION' }))

  dispatch(
    addNotification({
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

export const { setLoading, addNotification, clearNotification, handleExit } = statusSlice.actions
export default statusSlice.reducer
