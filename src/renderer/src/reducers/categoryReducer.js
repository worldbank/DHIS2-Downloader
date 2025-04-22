import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCategories, getOrganizationUnitGroupSets } from '../service/useApi'

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async ({ dhis2Url, username, password }) => {
    const response = await getCategories(dhis2Url, username, password)
    return response.categories
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
    categories: [],
    orgUnitGroupSets: [],
    selectedCategory: []
  },
  reducers: {
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      .addCase(fetchOrgUnitGroupSets.fulfilled, (state, action) => {
        state.orgUnitGroupSets = action.payload
      })
  }
})

export const { setSelectedCategory, clearSelectedCategory } = categorySlice.actions
export default categorySlice.reducer
