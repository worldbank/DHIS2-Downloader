import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isPopupOpen: false,
  exportConfig: {}
}

const exportSlice = createSlice({
  name: 'export',
  initialState,
  reducers: {
    openPopup: (state, action) => {
      state.isPopupOpen = true
      state.exportConfig = action.payload || {}
    },
    closePopup: (state) => {
      state.isPopupOpen = false
      state.exportConfig = {}
    }
  }
})

export const { openPopup, closePopup } = exportSlice.actions
export default exportSlice.reducer
