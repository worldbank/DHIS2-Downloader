// modalSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  modals: []
}

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.modals.push(action.payload)
    },
    closeModal: (state) => {
      state.modals.pop()
    }
  }
})

export const { openModal, closeModal } = modalSlice.actions
export default modalSlice.reducer
