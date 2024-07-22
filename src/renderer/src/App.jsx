import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { initializeAuth, disconnect } from './reducers/authReducer'
import MainPage from './pages/MainPage'
import NotificationModal from './pages/Modal'
import Login from './pages/Login'
import About from './pages/About'
import NavBar from './pages/NavBar'
import HistoryPage from './pages/DownloadHistory'
import DataDictionary from './pages/DataDictionary'
import { servicesDb, dictionaryDb } from './service/db'

const App = () => {
  // const [username, setUsername] = useState('')
  // const [password, setPassword] = useState('')
  // const [dhis2Url, setDhis2Url] = useState('')
  // const [accessToken, setAccessToken] = useState('')
  const dispatch = useDispatch()
  const { dhis2Url, username, password, accessToken } = useSelector((state) => state.auth)
  const { isLoading, errorMessage } = useSelector((state) => state.status)

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  const handleDisconnect = async () => {
    dispatch(disconnect())
  }

  const PrivateRoute = ({ children }) => {
    return accessToken ? children : <Navigate to="/login" />
  }

  return (
    <Router>
      <div className="min-w-full mx-auto">
        <NavBar accessToken={accessToken} username={username} handleDisconnect={handleDisconnect} />
      </div>
      <div className="bg-extra-light-green text-black min-h-screen flex flex-col">
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
                <HistoryPage dictionaryDb={dictionaryDb} />
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
        {(isLoading || errorMessage) && <NotificationModal />}
      </div>
    </Router>
  )
}

export default App
