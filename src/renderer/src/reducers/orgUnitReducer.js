import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getInitialOrganizationUnitLevel,
  getChildOrgUnits,
  getOrganizationLevels
} from '../service/useApi'

export const fetchInitialOrgUnits = createAsyncThunk(
  'orgUnit/fetchInitialOrgUnits',
  async ({ dhis2Url, username, password }) => {
    const response = await getInitialOrganizationUnitLevel(dhis2Url, username, password)
    return response.organisationUnits
  }
)

export const fetchChildOrgUnits = createAsyncThunk(
  'orgUnit/fetchChildOrgUnits',
  async ({ dhis2Url, parentId, username, password }) => {
    const response = await getChildOrgUnits(dhis2Url, parentId, username, password)
    return { parentId, data: response }
  }
)

export const fetchOrganizationLevels = createAsyncThunk(
  'orgUnit/fetchOrganizationLevels',
  async ({ dhis2Url, username, password }) => {
    const response = await getOrganizationLevels(dhis2Url, username, password)
    return response.organisationUnitLevels.sort((a, b) => a.level - b.level)
  }
)

const orgUnitSlice = createSlice({
  name: 'orgUnit',
  initialState: {
    orgUnits: [],
    expandedOrgUnits: [],
    selectedOrgUnits: [],
    allOrgUnitLevels: [],
    selectedOrgUnitLevels: []
  },
  reducers: {
    toggleOrgUnitSelection: (state, action) => {
      const unitId = action.payload
      if (state.selectedOrgUnits.includes(unitId)) {
        state.selectedOrgUnits = state.selectedOrgUnits.filter((id) => id !== unitId)
      } else {
        state.selectedOrgUnits.push(unitId)
      }
    },
    toggleOrgUnitExpansion: (state, action) => {
      const unitId = action.payload
      if (state.expandedOrgUnits.includes(unitId)) {
        state.expandedOrgUnits = state.expandedOrgUnits.filter((id) => id !== unitId)
      } else {
        state.expandedOrgUnits.push(unitId)
      }
    },
    updateOrgUnitLevels: (state, action) => {
      const level = action.payload
      if (state.selectedOrgUnitLevels.includes(level)) {
        state.selectedOrgUnitLevels = state.selectedOrgUnitLevels.filter((l) => l !== level)
      } else {
        state.selectedOrgUnitLevels.push(level)
      }
    },
    clearOrgUnitSelections: (state) => {
      state.selectedOrgUnits = []
    },
    clearOrgUnitLevels: (state) => {
      state.selectedOrgUnitLevels = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizationLevels.fulfilled, (state, action) => {
        state.allOrgUnitLevels = action.payload
      })
      .addCase(fetchInitialOrgUnits.fulfilled, (state, action) => {
        state.orgUnits = action.payload
      })
      .addCase(fetchChildOrgUnits.fulfilled, (state, action) => {
        const { parentId, data } = action.payload
        const updateOrgUnits = (units, parentId, data) => {
          return units.map((unit) => {
            if (unit.id === parentId) {
              return {
                ...unit,
                children: data.children || []
              }
            }
            if (unit.children) {
              return {
                ...unit,
                children: updateOrgUnits(unit.children, parentId, data)
              }
            }
            return unit
          })
        }
        state.orgUnits = updateOrgUnits(state.orgUnits, parentId, data)
      })
  }
})

export const {
  toggleOrgUnitSelection,
  toggleOrgUnitExpansion,
  updateOrgUnitLevels,
  clearOrgUnitSelections,
  clearOrgUnitLevels
} = orgUnitSlice.actions

export default orgUnitSlice.reducer
