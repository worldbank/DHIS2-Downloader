import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { initializeAuth, disconnect } from './reducers/authReducer'
import MainPage from './pages/MainPage'
import Login from './pages/Login'
import About from './pages/About'
import NavBar from './pages/NavBar'
import DataDictionary from './pages/DataDictionary'
import { servicesDb, dictionaryDb } from './service/db'

const App = () => {
  // const [username, setUsername] = useState('')
  // const [password, setPassword] = useState('')
  // const [dhis2Url, setDhis2Url] = useState('')
  // const [accessToken, setAccessToken] = useState('')
  const dispatch = useDispatch()
  const { dhis2Url, username, password, accessToken } = useSelector((state) => state.auth)
  const { notification } = useSelector((state) => state.status)

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  const handleDisconnect = async () => {
    dispatch(disconnect())
  }

  // useEffect(() => {
  //   console.log('App start...')
  //   if (
  //     localStorage.getItem('accessToken') &&
  //     localStorage.getItem('dhis2Url') &&
  //     localStorage.getItem('username') &&
  //     localStorage.getItem('password')
  //   ) {
  //     setAccessToken(localStorage.getItem('accessToken'))
  //     setDhis2Url(localStorage.getItem('dhis2Url'))
  //     setUsername(localStorage.getItem('username'))
  //     setPassword(localStorage.getItem('password'))
  //   }
  //   if (localStorage.getItem('dhis2Url') && localStorage.getItem('username')) {
  //     setDhis2Url(localStorage.getItem('dhis2Url'))
  //     setUsername(localStorage.getItem('username'))
  //   }
  // }, [])

  // const handleConnect = async (event) => {
  //   event.preventDefault()
  //   try {
  //     const data = await getUserInfo(dhis2Url, username, password)
  //     if (data.id) {
  //       const token = data.id
  //       setAccessToken(token)
  //       localStorage.setItem('accessToken', token)
  //       localStorage.setItem('username', username)
  //       localStorage.setItem('password', password)
  //       localStorage.setItem('dhis2Url', dhis2Url)
  //       const elements = await getDataElements(dhis2Url, username, password)
  //       const indicators = await getIndicators(dhis2Url, username, password)
  //       const catOptionCombos = await getCategoryOptionCombos(dhis2Url, username, password)
  //       await dictionaryDb.dataElements.bulkAdd(elements.dataElements)
  //       await dictionaryDb.indicators.bulkAdd(indicators.indicators)
  //       await dictionaryDb.catOptionCombos.bulkAdd(catOptionCombos.categoryOptionCombos)
  //     }
  //   } catch (error) {
  //     alert('Invalid Username or Password')
  //     localStorage.clear()
  //     console.log(error)
  //   }
  // }

  // const handleDisconnect = async () => {
  //   setAccessToken('')
  //   setPassword('')
  //   setUsername('')
  //   localStorage.removeItem('accessToken')
  //   localStorage.removeItem('password')
  //   try {
  //     await servicesDb.close()
  //     await dictionaryDb.close()
  //     await servicesDb.delete()
  //     await dictionaryDb.delete()
  //     console.log('Database deleted on logout.')
  //   } catch (error) {
  //     console.error('Failed to delete db:', error.stack)
  //   }
  //   window.location.reload()
  // }

  const PrivateRoute = ({ children }) => {
    return accessToken ? children : <Navigate to="/login" />
  }

  return (
    <Router>
      <div className="bg-teal-green text-black min-h-screen flex flex-col">
        <div className="min-w-full mx-auto">
          <NavBar
            accessToken={accessToken}
            username={username}
            handleDisconnect={handleDisconnect}
          />
        </div>

        <Routes>
          <Route path="/about" element={<About />} />
          <Route
            path="/dictionary"
            element={
              <PrivateRoute>
                <DataDictionary dictionaryDb={dictionaryDb} />
              </PrivateRoute>
            }
          />
          <Route
            path="/login"
            element={accessToken ? <Navigate replace to="/home" /> : <Login />}
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <MainPage
                  dhis2Url={dhis2Url}
                  username={username}
                  password={password}
                  dictionaryDb={dictionaryDb}
                  servicesDb={servicesDb}
                />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
