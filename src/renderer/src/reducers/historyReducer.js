import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedRows: [],
  editedRow: {
    rowId: null,
    note: ''
  }
}

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setSelectedRows: (state, action) => {
      const id = action.payload
      const index = state.selectedRows.indexOf(id)
      if (index >= 0) {
        state.selectedRows.splice(index, 1)
      } else {
        state.selectedRows.push(id)
      }
    },
    selectAllRows: (state, action) => {
      state.selectedRows = action.payload
    },
    setEditedRow: (state, action) => {
      const { id, note } = action.payload
      state.editedRow.rowId = id
      state.editedRow.note = note || ''
    },
    clearEditedRow: (state) => {
      state.editedRow = { rowId: null, note: '' }
    }
  }
})

export const { setSelectedRows, selectAllRows, setEditedRow, clearEditedRow } = historySlice.actions
export default historySlice.reducer
