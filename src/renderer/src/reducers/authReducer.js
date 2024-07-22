import { createSlice } from '@reduxjs/toolkit'
import {
  getUserInfo,
  getDataElements,
  getIndicators,
  getProgramIndicators,
  getCategoryOptionCombos
} from '../service/useApi'
import { dictionaryDb, servicesDb } from '../service/db'
import { setLoading, setError, setNotification } from '../reducers/statusReducer'

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
  dispatch(setLoading(true))
  try {
    const storedAccessToken = localStorage.getItem('accessToken')
    const storedDhis2Url = localStorage.getItem('dhis2Url')
    const storedUsername = localStorage.getItem('username')
    const storedPassword = localStorage.getItem('password')

    if (storedAccessToken && storedDhis2Url && storedUsername && storedPassword) {
      dispatch(setAccessToken(storedAccessToken))
      dispatch(setDhis2Url(storedDhis2Url))
      dispatch(setUsername(storedUsername))
      dispatch(setPassword(storedPassword))
    } else if (storedDhis2Url && storedUsername) {
      dispatch(setDhis2Url(storedDhis2Url))
      dispatch(setUsername(storedUsername))
    }
  } catch (error) {
    dispatch(setError('Failed to initialize authentication'))
  } finally {
    dispatch(setLoading(false))
  }
}

export const connect = (dhis2Url, username, password) => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    const data = await getUserInfo(dhis2Url, username, password)
    if (data.id) {
      const token = data.id
      dispatch(setAccessToken(token))
      localStorage.setItem('accessToken', token)
      localStorage.setItem('username', username)
      localStorage.setItem('password', password)
      localStorage.setItem('dhis2Url', dhis2Url)

      const [elements, indicators, programIndicators, catOptionCombos] = await Promise.all([
        getDataElements(dhis2Url, username, password),
        getIndicators(dhis2Url, username, password),
        getProgramIndicators(dhis2Url, username, password),
        getCategoryOptionCombos(dhis2Url, username, password)
      ])

      await Promise.all([
        dictionaryDb.dataElements.bulkAdd(
          elements.dataElements.map((element) => ({ ...element, category: 'DataElement' }))
        ),
        dictionaryDb.indicators.bulkAdd(
          indicators.indicators.map((indicator) => ({ ...indicator, category: 'Indicator' }))
        ),
        dictionaryDb.programIndicators.bulkAdd(
          programIndicators.programIndicators.map((pi) => ({
            ...pi,
            category: 'ProgramIndicator'
          }))
        ),
        dictionaryDb.catOptionCombos.bulkAdd(catOptionCombos.categoryOptionCombos)
      ])

      dispatch(setNotification({ message: 'Connected successfully', type: 'success' }))
    } else {
      dispatch(setError('Invalid Username or Password'))
    }
  } catch (error) {
    if (error.message) {
      dispatch(setError(error.message))
    } else {
      dispatch(setError(error))
    }
    localStorage.clear()
  } finally {
    dispatch(setLoading(false))
  }
}

export const disconnect = () => async (dispatch) => {
  dispatch(clearAuth())
  localStorage.removeItem('accessToken')
  localStorage.removeItem('password')
  try {
    await servicesDb.close()
    await dictionaryDb.close()
    await servicesDb.delete()
    await dictionaryDb.delete()
    console.log('Database deleted on logout.')
  } catch (error) {
    console.error('Failed to delete db:', error.stack)
  }
  window.location.reload()
}

export default authSlice.reducer
