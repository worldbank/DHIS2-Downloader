import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { mouseOver, mouseLeave, mouseClick } from '../reducers/mouseReducer'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// eslint-disable-next-line react/prop-types
const NavBar = ({ accessToken, username, handleDisconnect }) => {
  const dispatch = useDispatch()
  const openDropdowns = useSelector((state) => state.mouse.openDropdowns)
  const timerRef = useRef(null)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const { i18n } = useTranslation()

  const handleMouseEnter = (dropdownId) => {
    clearTimeout(timerRef.current)
    dispatch(mouseOver(dropdownId))
  }

  const handleMouseLeave = (dropdownId) => {
    timerRef.current = setTimeout(() => {
      dispatch(mouseLeave(dropdownId))
    }, 300)
  }

  const handleClickOutside = () => {
    dispatch(mouseClick())
  }

  const toggleMenu = () => setMenuOpen(!isMenuOpen)

  // Minimalistic Language Switch
  const switchToEnglish = () => {
    i18n.changeLanguage('en')
    setCurrentLanguage('en')
  }

  const switchToFrench = () => {
    i18n.changeLanguage('fr')
    setCurrentLanguage('fr')
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <header className="w-full bg-gff-green py-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="text-left">
          <span className="text-2xl font-bold text-white">FASTR DHIS2 Data Downloader</span>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={toggleMenu}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>

        <div
          className={`flex-col items-start md:flex-row md:flex gap-6 ${
            isMenuOpen ? 'flex' : 'hidden'
          } md:flex`}
        >
          {/* Download Menu */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('home')}
            onMouseLeave={() => handleMouseLeave('home')}
          >
            <button
              className="text-lg text-white hover:text-gray-300 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              Download
            </button>
            {openDropdowns['home'] && (
              <div
                className="absolute mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20 dropdown-menu"
                onMouseEnter={() => handleMouseEnter('home')}
                onMouseLeave={() => handleMouseLeave('home')}
              >
                <Link
                  to="/home"
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => dispatch(mouseClick())}
                >
                  Home
                </Link>
                <Link
                  to="/history"
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => dispatch(mouseClick())}
                >
                  History
                </Link>
              </div>
            )}
          </div>

          {/* Facility Menu */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('facility')}
            onMouseLeave={() => handleMouseLeave('facility')}
          >
            <button
              className="text-lg text-white hover:text-gray-300 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              Facility
            </button>
            {openDropdowns['facility'] && (
              <div
                className="absolute mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20 dropdown-menu"
                onMouseEnter={() => handleMouseEnter('facility')}
                onMouseLeave={() => handleMouseLeave('facility')}
              >
                <Link
                  to="/map"
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => dispatch(mouseClick())}
                >
                  Map
                </Link>
                <Link
                  to="/facility"
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => dispatch(mouseClick())}
                >
                  Table
                </Link>
              </div>
            )}
          </div>

          {/* Dictionary */}
          <Link to="/dictionary" className="text-lg text-white hover:text-gray-300">
            Dictionary
          </Link>

          {/* About */}
          <Link to="/about" className="text-lg text-white hover:text-gray-300">
            About
          </Link>

          {/* User Dropdown (Sign out) */}
          {accessToken && (
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('navbar')}
              onMouseLeave={() => handleMouseLeave('navbar')}
            >
              <button
                className="text-lg text-white hover:text-gray-300 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                {username}
              </button>
              {openDropdowns['navbar'] && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20 dropdown-menu"
                  onMouseEnter={() => handleMouseEnter('navbar')}
                  onMouseLeave={() => handleMouseLeave('navbar')}
                >
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

          {/* Minimalistic Language Switcher */}
          <div className="flex items-center space-x-2">
            <button
              className={`px-2 py-1 rounded-full border text-sm ${
                currentLanguage === 'en'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-600 border-blue-600'
              }`}
              onClick={switchToEnglish}
            >
              EN
            </button>
            <button
              className={`px-2 py-1 rounded-full border text-sm ${
                currentLanguage === 'fr'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-600 border-blue-600'
              }`}
              onClick={switchToFrench}
            >
              FR
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default NavBar
