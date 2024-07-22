import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: [],
  selectedDataType: 'All',
  searchQuery: '',
  filteredElements: [],
  selectedElements: [],
  addedElements: []
}

const dataElementsSlice = createSlice({
  name: 'dataElements',
  initialState,
  reducers: {
    setData: (state, action) => {
      state.data = action.payload
    },
    setSelectedDataType: (state, action) => {
      state.selectedDataType = action.payload
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setFilteredElements: (state, action) => {
      state.filteredElements = action.payload
    },
    setSelectedElements: (state, action) => {
      state.selectedElements = action.payload
    },
    addSelectedElements: (state, action) => {
      const newElements = action.payload.filter(
        (element) => !state.addedElements.find((e) => e.id === element.id)
      )
      state.addedElements.push(...newElements)
    },
    removeElement: (state, action) => {
      state.addedElements = state.addedElements.filter((element) => element.id !== action.payload)
    }
  }
})

export const {
  setData,
  setSearchQuery,
  setSelectedDataType,
  setFilteredElements,
  setSelectedElements,
  addSelectedElements,
  removeElement
} = dataElementsSlice.actions

export default dataElementsSlice.reducer
