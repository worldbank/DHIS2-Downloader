import { createSlice } from '@reduxjs/toolkit'
import { dictionaryDb } from '../service/db'

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

export const rehydrateAppStateFromDexie = () => async (dispatch) => {
  try {
    const allElements = await dictionaryDb.elements.toArray()

    const categories = allElements.filter((el) => el.category === 'category')
    const orgUnitGroupSets = allElements.filter((el) => el.category === 'organisationUnitGroupSets')

    dispatch(setCategories(categories))
    dispatch(setOrgUnitGroupSets(orgUnitGroupSets))
  } catch (error) {
    console.error('[rehydrateAppStateFromDexie] Failed:', error)
  }
}

export default categorySlice.reducer
