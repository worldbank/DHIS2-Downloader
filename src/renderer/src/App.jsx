import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { initializeAuth } from './reducers/authReducer'
import { initializeSecretKey } from './utils/sessionManager'
import MainPage from './pages/MainPage'
import Login from './pages/Login'
import Footer from './pages/Footer'
import About from './pages/About'
import NavBar from './pages/NavBar'
import HistoryPage from './pages/DownloadHistory'
import DataDictionary from './pages/DataDictionary'
import Map from './pages/Facility/Map'
import FacilityTable from './pages/Facility/Table'
import ModalManager from './pages/Modals/ModalManager'
import PrivacyPolicy from './pages/Privacy'
import { servicesDb, dictionaryDb, queryDb } from './service/db'
import { openModal } from './reducers/modalReducer'

const App = () => {
  const dispatch = useDispatch()
  const { dhis2Url, username, password, accessToken } = useSelector((state) => state.auth)

  useEffect(() => {
    ;(async () => {
      try {
        await initializeSecretKey()
        dispatch(initializeAuth())
      } catch (error) {
        console.error('Failed to initialize application:', error)
      }
    })()
  }, [dispatch])

  const handleDisconnect = async () => {
    dispatch(openModal({ type: 'SIGN_OUT' }))
  }

  // eslint-disable-next-line react/prop-types
  const PrivateRoute = ({ children }) => {
    return accessToken ? children : <Navigate to="/login" />
  }

  return (
    <Router>
      <div className="min-w-full mx-auto">
        <NavBar accessToken={accessToken} username={username} handleDisconnect={handleDisconnect} />
      </div>
      <div className="bg-grey-100 text-black min-h-screen flex flex-col">
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
            path="/history"
            element={
              <PrivateRoute>
                <HistoryPage dictionaryDb={dictionaryDb} queryDb={queryDb} />
              </PrivateRoute>
            }
          />
          <Route
            path="/map"
            element={
              <PrivateRoute>
                <Map />
              </PrivateRoute>
            }
          />
          <Route
            path="/facility"
            element={
              <PrivateRoute>
                <FacilityTable />
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
                <MainPage dictionaryDb={dictionaryDb} servicesDb={servicesDb} queryDb={queryDb} />
              </PrivateRoute>
            }
          />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
        <ModalManager />
      </div>
      <Footer />
    </Router>
  )
}

export default App
