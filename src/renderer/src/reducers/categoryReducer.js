import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCategoryCombination, getOrganizationUnitGroupSets } from '../service/useApi'

export const fetchCategoryCombinations = createAsyncThunk(
  'category/fetchCategoryCombinations',
  async ({ dhis2Url, username, password }) => {
    const response = await getCategoryCombination(dhis2Url, username, password)
    return response.categoryCombos
  }
)

export const fetchOrgUnitGroupSets = createAsyncThunk(
  'category/fetchOrgUnitGroupSets',
  async ({ dhis2Url, username, password }) => {
    const response = await getOrganizationUnitGroupSets(dhis2Url, username, password)
    return response.organisationUnitGroupSets
  }
)

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    category: [],
    selectedCategory: []
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      const coId = action.payload
      if (state.selectedCategory.includes(coId)) {
        state.selectedCategory = state.selectedCategory.filter((id) => id !== coId)
      } else {
        state.selectedCategory.push(coId)
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryCombinations.fulfilled, (state, action) => {
        state.category = [...state.category, ...action.payload]
      })
      .addCase(fetchOrgUnitGroupSets.fulfilled, (state, action) => {
        state.category = [...state.category, ...action.payload]
      })
  }
})

export const { setSelectedCategory } = categorySlice.actions

export default categorySlice.reducer
