import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { getUserInfo } from './service/useApi'
import MainPage from './pages/MainPage'
import Login from './pages/Login'
import About from './pages/About'
import TopMenu from './pages/TopMenu'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [dhis2Url, setDhis2Url] = useState('')
  const [accessToken, setAccessToken] = useState('')

  useEffect(() => {
    console.log('App start...')
    if (
      localStorage.getItem('accessToken') &&
      localStorage.getItem('dhis2Url') &&
      localStorage.getItem('username') &&
      localStorage.getItem('password')
    ) {
      setAccessToken(localStorage.getItem('accessToken'))
      setDhis2Url(localStorage.getItem('dhis2Url'))
      setUsername(localStorage.getItem('username'))
      setPassword(localStorage.getItem('password'))
    }
    if (localStorage.getItem('dhis2Url') && localStorage.getItem('username')) {
      setDhis2Url(localStorage.getItem('dhis2Url'))
      setUsername(localStorage.getItem('username'))
    }
  }, [])

  const handleConnect = async (event) => {
    event.preventDefault()
    try {
      const data = await getUserInfo(dhis2Url, username, password)
      if (data.id) {
        const token = data.id
        setAccessToken(token)
        localStorage.setItem('accessToken', token)
        localStorage.setItem('username', username)
        localStorage.setItem('password', password)
        localStorage.setItem('dhis2Url', dhis2Url)
        console.log('Login successful, token:', token)
      }
    } catch (error) {
      alert('Invalid Username or Password')
      localStorage.clear()
      console.log(error)
    }
  }

  const handleDisconnect = () => {
    setAccessToken('')
    setPassword('')
    setUsername('')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('password')
    window.location.reload()
  }

  const PrivateRoute = ({ children }) => {
    return accessToken ? children : <Navigate to="/login" />
  }

  return (
    <Router>
      <div className="bg-teal-200 text-black min-h-screen">
        <TopMenu
          accessToken={accessToken}
          username={username}
          handleDisconnect={handleDisconnect}
        />
        <Routes>
          <Route path="/about" element={<About />} />
          <Route
            path="/login"
            element={
              accessToken ? (
                <Navigate replace to="/home" />
              ) : (
                <Login
                  dhis2Url={dhis2Url}
                  setDhis2Url={setDhis2Url}
                  username={username}
                  setUsername={setUsername}
                  password={password}
                  setPassword={setPassword}
                  handleConnect={handleConnect}
                />
              )
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <MainPage dhis2Url={dhis2Url} username={username} password={password} />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
