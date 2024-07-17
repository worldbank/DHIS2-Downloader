import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  frequency: 'year',
  startDate: '',
  endDate: ''
}

const dateRangeSlice = createSlice({
  name: 'dateRange',
  initialState,
  reducers: {
    setStartDate: (state, action) => {
      state.startDate = action.payload
    },
    setEndDate: (state, action) => {
      state.endDate = action.payload
    },
    setFrequency: (state, action) => {
      state.frequency = action.payload
    }
  }
})

export const { setStartDate, setEndDate, setFrequency } = dateRangeSlice.actions

export default dateRangeSlice.reducer
