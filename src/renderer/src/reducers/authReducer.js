import { createSlice } from '@reduxjs/toolkit'
import {
  getUserInfo,
  getDataElements,
  getIndicators,
  getProgramIndicators,
  getCategoryOptionCombos,
  getDataSets,
  getOrganizationUnitGroupSets
} from '../service/useApi'
import { dictionaryDb, servicesDb, queryDb } from '../service/db'
import { triggerLoading, triggerNotification } from '../reducers/statusReducer'
import { getSecretKey } from '../utils/sessionManager'
import { encryptPassword, decryptPassword } from '../utils/cryptoUtils'

const initialState = {
  dhis2Url: '',
  username: '',
  password: '',
  accessToken: ''
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setDhis2Url: (state, action) => {
      state.dhis2Url = action.payload
    },
    setUsername: (state, action) => {
      state.username = action.payload
    },
    setPassword: (state, action) => {
      state.password = action.payload
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload
    },
    clearAuth: (state) => {
      state.password = ''
      state.accessToken = ''
    }
  }
})

export const { setDhis2Url, setUsername, setPassword, setAccessToken, clearAuth } =
  authSlice.actions

export const initializeAuth = () => async (dispatch) => {
  dispatch(triggerLoading(true))
  try {
    const storedAccessToken = localStorage.getItem('accessToken')
    const storedDhis2Url = localStorage.getItem('dhis2Url')
    const storedUsername = localStorage.getItem('username')
    const encryptedPassword = localStorage.getItem('encryptedPassword')
    let password
    if (encryptedPassword) {
      password = decryptPassword(encryptedPassword, getSecretKey())
    }

    if (storedAccessToken && storedDhis2Url && storedUsername && password) {
      dispatch(setAccessToken(storedAccessToken))
      dispatch(setDhis2Url(storedDhis2Url))
      dispatch(setUsername(storedUsername))
      dispatch(setPassword(password))
    } else if (storedDhis2Url && storedUsername) {
      dispatch(setDhis2Url(storedDhis2Url))
      dispatch(setUsername(storedUsername))
    }
  } catch (error) {
    dispatch(triggerNotification({ message: 'Failed to initialize authentication', type: 'error' }))
  } finally {
    dispatch(triggerLoading(false))
  }
}

export const connect = (dhis2Url, username, password) => async (dispatch) => {
  try {
    const data = await getUserInfo(dhis2Url, username, password)
    if (data.id) {
      dispatch(triggerLoading(true))
      const token = data.id
      dispatch(setAccessToken(token))
      localStorage.setItem('accessToken', token)
      localStorage.setItem('username', username)
      // localStorage.setItem('password', password)
      localStorage.setItem('dhis2Url', dhis2Url)
      const encryptedPassword = encryptPassword(password, getSecretKey())
      localStorage.setItem('encryptedPassword', encryptedPassword)

      const [
        elements,
        indicators,
        programIndicators,
        catOptionCombos,
        dataSetsRaw,
        orgUnitGroupSets
      ] = await Promise.all([
        getDataElements(dhis2Url, username, password),
        getIndicators(dhis2Url, username, password),
        getProgramIndicators(dhis2Url, username, password),
        getCategoryOptionCombos(dhis2Url, username, password),
        getDataSets(dhis2Url, username, password),
        getOrganizationUnitGroupSets(dhis2Url, username, password)
      ])

      const dataSetMetrics = [
        'REPORTING_RATE',
        'REPORTING_RATE_ON_TIME',
        'ACTUAL_REPORTS',
        'ACTUAL_REPORTS_ON_TIME',
        'EXPECTED_REPORTS'
      ]

      const dataSets = dataSetsRaw.dataSets.flatMap((ds) =>
        dataSetMetrics.map((metric) => ({
          ...ds,
          id: `${ds.id}.${metric}`,
          displayName: `${ds.displayName} (${metric})`,
          category: 'dataSets'
        }))
      )

      const allElements = [
        ...elements.dataElements.map((element) => ({ ...element, category: 'DataElement' })),
        ...indicators.indicators.map((indicator) => ({ ...indicator, category: 'Indicator' })),
        ...programIndicators.programIndicators.map((pi) => ({
          ...pi,
          category: 'ProgramIndicator'
        })),
        ...catOptionCombos.categoryOptionCombos.map((el) => ({
          ...el,
          category: 'CategoryOptionCombos'
        })),
        ...dataSets,
        ...orgUnitGroupSets.organisationUnitGroupSets.map((og) => ({
          ...og,
          category: 'OrganizationUnitGroupSets'
        }))
      ]

      await dictionaryDb.elements.bulkAdd(allElements)

      dispatch(triggerNotification({ message: 'Connected successfully', type: 'success' }))
    } else {
      dispatch(triggerNotification({ message: 'Invalid Username or Password', type: 'error' }))
    }
  } catch (error) {
    dispatch(triggerNotification({ message: error.message || error.toString(), type: 'error' }))
    localStorage.clear()
  } finally {
    dispatch(triggerLoading(false))
  }
}

export const clearHistory = () => async (dispatch) => {
  try {
    await queryDb.close()
    await queryDb.delete()
    console.log('History deleted on logout.')
  } catch (error) {
    console.error('Failed to delete db:', error.stack)
  }
}

export const disconnect = () => async (dispatch) => {
  try {
    dispatch(clearAuth())
    localStorage.removeItem('accessToken')
    localStorage.removeItem('password')
    await servicesDb.close()
    await dictionaryDb.close()
    await servicesDb.delete()
    await dictionaryDb.delete()
  } catch (error) {
    console.error('Failed to delete db:', error.stack)
  } finally {
    window.location.reload()
  }
}

export default authSlice.reducer
