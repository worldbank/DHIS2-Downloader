import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  openDropdowns: {}
}

const mouseSlice = createSlice({
  name: 'mouse',
  initialState,
  reducers: {
    mouseOver: (state, action) => {
      state.openDropdowns[action.payload] = true;
    },
    mouseLeave: (state, action) => {
      state.openDropdowns[action.payload] = false;
    },
    mouseClick: (state, action) => {
      state.openDropdowns = {};
    }
  }
})

export const { mouseOver, mouseLeave, mouseClick } = mouseSlice.actions
export default mouseSlice.reducer
