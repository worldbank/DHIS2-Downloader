import { Link } from 'react-router-dom'
import { useState } from 'react'
import fastrLogo from '../assets/FASTR_Logo_White_En.png'

const NavBar = ({ accessToken, username, handleDisconnect }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  return (
    <header className="w-full bg-blue-600 py-2">
      <nav className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-12 max-w-20 max-h-15 mr-4">
              <img src={fastrLogo} className="object-scale-down" alt="FASTR Logo" />
            </div>
            <span className="text-2xl font-semibold whitespace-nowrap text-white">
              DHIS2 Data Downloader
            </span>
          </div>
          <div className="flex items-center gap-5 mt-3 sm:mt-0">
            <Link to="/home" className="text-lg text-white hover:text-gray-200">
              Home
            </Link>
            <Link to="/dictionary" className="text-lg text-gray-200 hover:text-white">
              Dictionary
            </Link>
            <Link to="/about" className="text-lg text-gray-200 hover:text-white">
              About
            </Link>
            {accessToken && (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="text-lg text-gray-200 hover:text-white focus:outline-none"
                >
                  {username}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
                    <button
                      onClick={handleDisconnect}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
export default NavBar
