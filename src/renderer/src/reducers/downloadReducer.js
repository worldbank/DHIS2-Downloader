import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  chunkingStrategy: 3 // Default chunking size
}

export const downloadSlice = createSlice({
  name: 'download',
  initialState,
  reducers: {
    setChunkingStrategy: (state, action) => {
      const strategy = parseInt(action.payload, 10)
      if (!strategy || isNaN(strategy) || strategy <= 0) {
        console.error(`Invalid chunking strategy: ${action.payload}`)
        return
      }
      state.chunkingStrategy = strategy // Update Redux state
    }
  }
})

export const { setChunkingStrategy } = downloadSlice.actions
export default downloadSlice.reducer
