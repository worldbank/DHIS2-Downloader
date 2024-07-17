import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCategoryCombination } from '../service/useApi'

export const fetchCategoryCombinations = createAsyncThunk(
  'category/fetchCategoryCombinations',
  async ({ dhis2Url, username, password }) => {
    const response = await getCategoryCombination(dhis2Url, username, password)
    return response.categoryCombos
  }
)

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    category: [],
    selectedCategory: ''
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategoryCombinations.fulfilled, (state, action) => {
      state.category = action.payload
    })
  }
})

export const { setSelectedCategory } = categorySlice.actions

export default categorySlice.reducer
