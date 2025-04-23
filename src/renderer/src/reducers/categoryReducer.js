import { createSlice } from '@reduxjs/toolkit'

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    orgUnitGroupSets: [],
    selectedCategory: []
  },
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload
    },
    setOrgUnitGroupSets: (state, action) => {
      state.orgUnitGroupSets = action.payload
    },
    setSelectedCategory: (state, action) => {
      const id = action.payload
      if (state.selectedCategory.includes(id)) {
        state.selectedCategory = state.selectedCategory.filter((x) => x !== id)
      } else {
        state.selectedCategory.push(id)
      }
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = []
    }
  }
})

export const { setCategories, setOrgUnitGroupSets, setSelectedCategory, clearSelectedCategory } =
  categorySlice.actions
export default categorySlice.reducer
