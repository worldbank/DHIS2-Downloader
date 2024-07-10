const Login = ({
  dhis2Url,
  setDhis2Url,
  username,
  setUsername,
  password,
  setPassword,
  handleConnect
}) => {
  const handleDHIS2URL = (event) => {
    setDhis2Url(event.target.value)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-teal-100">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-center text-black">Welcome!</h3>
        <form onSubmit={handleConnect}>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">DHIS2 URL</label>
              <input
                type="text"
                placeholder="DHIS2 URL"
                value={dhis2Url}
                onChange={handleDHIS2URL}
                className="w-full px-4 py-2 border border-teal-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2">Username</label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-teal-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-teal-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
              >
                Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
