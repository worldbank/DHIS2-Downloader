import { useState, useEffect } from 'react'
import Login from './components/Login'
import { getUserInfo } from './service/useApi'
import MainPage from './components/MainPage'
import { clearCacheData } from './utils/helpers'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [dhis2Url, setDhis2Url] = useState('')
  const [accessToken, setAccessToken] = useState('')

  useEffect(() => {
    console.log('App start...')
    if (
      localStorage['accessToken'] &&
      localStorage['dhis2Url'] &&
      localStorage['username'] &&
      localStorage['password']
    ) {
      setAccessToken(localStorage['accessToken'])
      setDhis2Url(localStorage['dhis2Url'])
      setUsername(localStorage['username'])
      setPassword(localStorage['password'])
    }
    if (localStorage['dhis2Url'] && localStorage['username']) {
      setDhis2Url(localStorage['dhis2Url'])
      setUsername(localStorage['username'])
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

  return (
    <div className="bg-teal-300 text-black min-h-screen">
      {!accessToken ? (
        <Login
          dhis2Url={dhis2Url}
          setDhis2Url={setDhis2Url}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          handleConnect={handleConnect}
        />
      ) : (
        <MainPage
          dhis2Url={dhis2Url}
          username={username}
          password={password}
          handleDisconnect={handleDisconnect}
        />
      )}
    </div>
  )
}
export default App
