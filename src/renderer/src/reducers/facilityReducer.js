// reducers/facilitySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { dictionaryDb } from '../service/db'
import { topology } from 'topojson-server'
import { presimplify, simplify, quantile } from 'topojson-simplify'
import { feature } from 'topojson-client'
import { getFacilityLists, getGeoFeatures } from '../service/useApi'
import { getGeoJSONType, parseCoordinates } from '../utils/geoUtils'

export const fetchFacilityData = createAsyncThunk(
  'facility/fetchFacilityData',
  async ({ dhis2Url, username, password }, { dispatch }) => {
    try {
      // Always fetch fresh data
      const [geoFeatures, facilities] = await Promise.all([
        dispatch(fetchGeoFeatures({ dhis2Url, username, password })).unwrap(),
        dispatch(fetchFacilities({ dhis2Url, username, password })).unwrap()
      ])

      const mergedData = await dispatch(
        mergeFacilitiesAndGeoFeatures({ geoFeatures, facilities })
      ).unwrap()

      // Process and save to Dexie
      await saveToDatabase(mergedData)

      // Return success without data - data will be loaded from Dexie
      return { success: true }
    } catch (error) {
      console.error('Error fetching facility data:', error)
      throw error
    }
  }
)

// New thunk to load data from Dexie
export const loadDataFromDexie = createAsyncThunk('facility/loadDataFromDexie', async () => {
  try {
    const data = await dictionaryDb.facility.toArray()
    if (!data || data.length === 0) {
      throw Error('No data found in IndexedDb.')
    }

    // Convert to GeoJSON after loading from Dexie
    const geoJsonData = convertToGeoJSON(data)

    return {
      mergedData: data,
      geoJsonData
    }
  } catch (error) {
    console.error('Error loading data from Dexie:', error)
    throw error
  }
})

// Function to save processed data to Dexie
const saveToDatabase = async (data) => {
  const processedData = await processData(data)
  await dictionaryDb.facility.clear()
  await dictionaryDb.facility.bulkAdd(processedData)
  return processedData
}

// Rest of the helper functions remain the same
const processData = async (data) => {
  return data
    .map((item) => ({
      ...item,
      geometry: item.geometry,
      level: Number(item.level),
      displayName: item.displayName || item.name
    }))
    .sort((a, b) => (b.level || 0) - (a.level || 0))
}

// Async thunk to fetch geo features
export const fetchGeoFeatures = createAsyncThunk(
  'facility/fetchGeoFeatures',
  async ({ dhis2Url, username, password }) => {
    const levelString = 'LEVEL-1;LEVEL-2;LEVEL-3;LEVEL-4;LEVEL-5;LEVEL-6;LEVEL-7;LEVEL-8'
    const geoFeatures = await getGeoFeatures(dhis2Url, username, password, levelString)

    return geoFeatures.map((item) => ({
      id: item.id,
      path: item.pg,
      displayName: item.na,
      level: item.le,
      geometry: parseCoordinates(item.co) || null
    }))
  }
)

// Async thunk to fetch facilities
export const fetchFacilities = createAsyncThunk(
  'facility/fetchFacilities',
  async ({ dhis2Url, username, password }) => {
    const response = await getFacilityLists(dhis2Url, username, password)
    const facilities = response.organisationUnits
    if (facilities && facilities.length > 0) {
      const maxLevel = Math.max(...facilities.map((facility) => facility.level))
      const idNameMapping = facilities.reduce((acc, item) => {
        if (item.level < maxLevel) {
          acc[item.id] = item.displayName
        }
        return acc
      }, {})

      const decodePath = (path) => {
        const pathIds = path.split('/').filter(Boolean)
        const hierarchyIds = pathIds.slice(0, -1)
        return hierarchyIds.map((id) => idNameMapping[id] || id)
      }
      const processedFacilities = facilities
        .map((facility) => {
          let geometry = null
          if (facility.coordinates) {
            try {
              geometry = getGeoJSONType(JSON.parse(facility.coordinates))
            } catch (parseError) {
              console.warn('Invalid coordinates for facility:', facility.id, parseError)
              geometry = null
            }
          }
          return {
            ...facility,
            geometry: facility.geometry || geometry || null,
            decodedPath: decodePath(facility.path)
          }
        })
        .sort((a, b) => (b.level || 0) - (a.level || 0))
      return processedFacilities
    } else {
      return []
    }
  }
)

// Async thunk to merge facilities and geo features
export const mergeFacilitiesAndGeoFeatures = createAsyncThunk(
  'facility/mergeFacilitiesAndGeoFeatures',
  async ({ facilities, geoFeatures }) => {
    const facilityMap = new Map(facilities.map((facility) => [facility.id, facility]))
    const geoFeatureMap = new Map(geoFeatures.map((geo) => [geo.id, geo]))
    const uniqueIds = new Set([...facilityMap.keys(), ...geoFeatureMap.keys()])

    // Merge data based on unique IDs
    const mergedData = Array.from(uniqueIds).map((id) => {
      const facility = facilityMap.get(id) || {}
      const geoFeature = geoFeatureMap.get(id) || {}
      const merged = {
        id,
        ...geoFeature,
        ...facility,
        geometry: facility.geometry || geoFeature.geometry || null
      }

      return merged
    })
    return mergedData
  }
)

// convert data to GeoJSON and TopoJSON
const convertToGeoJSON = (data) => {
  const geoJSON = {
    type: 'FeatureCollection',
    features: data
      .filter((item) => item.geometry)
      .map((item) => ({
        type: 'Feature',
        properties: {
          id: item.id,
          name: item.displayName,
          level: item.level
        },
        geometry: item.geometry
      }))
  }

  let topoData = topology({ data: geoJSON })
  topoData = presimplify(topoData)
  const minWeight = quantile(topoData, 0.5)
  topoData = simplify(topoData, minWeight)
  const simplifiedGeoJSON = feature(topoData, topoData.objects.data)

  return simplifiedGeoJSON
}

const facilitySlice = createSlice({
  name: 'facility',
  initialState: {
    geoJsonData: null,
    mergedData: null,
    loading: false,
    error: null,
    dataProcessed: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacilityData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFacilityData.fulfilled, (state) => {
        // Don't set data here, just mark as not loading
        state.loading = false
      })
      .addCase(fetchFacilityData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(loadDataFromDexie.pending, (state) => {
        state.loading = true
        state.error = null
        state.dataProcessed = false
      })
      .addCase(loadDataFromDexie.fulfilled, (state, action) => {
        state.loading = false
        state.mergedData = action.payload.mergedData
        state.geoJsonData = action.payload.geoJsonData
        state.dataProcessed = true
      })
      .addCase(loadDataFromDexie.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
        state.dataProcessed = false
      })
  }
})

export default facilitySlice.reducer
