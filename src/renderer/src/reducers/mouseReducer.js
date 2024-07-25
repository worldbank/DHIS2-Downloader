import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  openDropdowns: {}
}

const mouseSlice = createSlice({
  name: 'mouse',
  initialState,
  reducers: {
    mouseOver: (state, action) => {
      state.openDropdowns[action.payload] = true
    },
    mouseLeave: (state, action) => {
      state.openDropdowns[action.payload] = false
    },
    mouseClick: (state, action) => {
      state.openDropdowns = {}
    },
    mouseToggle: (state, action) => {
      state.openDropdowns[action.payload] = !state.openDropdowns[action.payload]
    }
  }
})

export const { mouseOver, mouseLeave, mouseClick, mouseToggle } = mouseSlice.actions
export default mouseSlice.reducer
