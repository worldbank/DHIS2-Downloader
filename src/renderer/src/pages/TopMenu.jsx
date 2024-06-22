import { Link } from 'react-router-dom'
const TopMenu = ({ accessToken, username, handleDisconnect }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-teal-100 shadow-md">
      <div className="font-bold text-xl">DHIS2 Data Downloader</div>
      <div className="flex space-x-4">
        <span className="font-normal">
          <Link to="/home">Home</Link>
        </span>
        <span className="font-normal">
          <Link to="/about">About</Link>
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="font-normal">{username}</span>
        {accessToken && (
          <button onClick={handleDisconnect} className="text-blue-500 hover:text-blue-700">
            Sign out
          </button>
        )}
      </div>
    </div>
  )
}
export default TopMenu
