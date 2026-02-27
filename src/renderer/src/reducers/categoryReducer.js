import { createSlice } from '@reduxjs/toolkit'
import { dictionaryDb } from '../service/db'

const DEFAULT_CATEGORY_DIMENSION = {
  id: 'co',
  name: 'Default category disaggregation',
  shortName: 'Default category',
  dimension: 'co',
  category: 'category',
  isDefaultCategoryOptionDimension: true
}

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

      // Special handling for `dimension=co`:
      // - `co` is mutually exclusive with other category dimensions
      if (id === 'co') {
        if (state.selectedCategory.includes('co')) {
          // toggling off -> nothing selected
          state.selectedCategory = []
        } else {
          // toggling on -> only `co` selected
          state.selectedCategory = ['co']
        }
        return
      }

      // For other category dimensions:
      // - If `co` was selected, drop it
      let selected = state.selectedCategory.filter((x) => x !== 'co')

      if (selected.includes(id)) {
        selected = selected.filter((x) => x !== id)
      } else {
        selected.push(id)
      }

      state.selectedCategory = selected
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

    let categories = allElements.filter(
      (el) => el.category === 'category' || el.category === 'categoryOptionGroupSets'
    )

    // Inject the synthetic `dimension=co` option if it doesn't already exist
    const hasDefaultCo = categories.some((c) => c.id === 'co')
    if (!hasDefaultCo) {
      categories = [DEFAULT_CATEGORY_DIMENSION, ...categories]
    }

    const orgUnitGroupSets = allElements.filter((el) => el.category === 'organisationUnitGroupSets')

    dispatch(setCategories(categories))
    dispatch(setOrgUnitGroupSets(orgUnitGroupSets))
  } catch (error) {
    console.error('[rehydrateAppStateFromDexie] Failed:', error)
  }
}

export default categorySlice.reducer
