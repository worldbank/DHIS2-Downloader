import { Link } from "react-router-dom"

const TopMenu = ({ username, handleDisconnect }) => (
  <div className="flex justify-between items-center p-4 bg-gray-200 shadow-md">
    <div className="font-bold text-xl">DHIS2 Data Downloader</div>
    <div className="flex items-center">
      <span className="font-normal px-4">{username}</span>
      <button onClick={handleDisconnect} className="text-blue-500 hover:text-blue-700 px-4">
        Sign out
      </button>
    </div>
  </div>
)

export default TopMenu
