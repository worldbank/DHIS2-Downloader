import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { mouseOver, mouseLeave, mouseClick } from '../reducers/mouseReducer'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const NavBar = ({ accessToken, username, handleDisconnect }) => {
  const dispatch = useDispatch()
  const openDropdowns = useSelector((state) => state.mouse.openDropdowns)
  const timerRef = useRef(null)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const { i18n, t } = useTranslation()

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
      <nav className="max-w-screen-xl mx-auto px-4 flex justify-between items-center">
        <div className="text-left">
          <span className="text-2xl font-bold text-white">{t('navbar.title')}</span>
        </div>

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
          className={`flex-col items-start md:flex-row md:flex gap-6 ${isMenuOpen ? 'flex' : 'hidden'} md:flex`}
        >
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('home')}
            onMouseLeave={() => handleMouseLeave('home')}
          >
            <button
              className="text-lg text-white hover:text-gray-300 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {t('navbar.download')}
            </button>
            {openDropdowns['home'] && (
              <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20 dropdown-menu">
                <Link
                  to="/home"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => dispatch(mouseClick())}
                >
                  {t('navbar.home')}
                </Link>
                <Link
                  to="/history"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => dispatch(mouseClick())}
                >
                  {t('navbar.history')}
                </Link>
                <Link
                  to="/download-results"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => dispatch(mouseClick())}
                >
                  {t('navbar.downloadResults')}
                </Link>
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('facility')}
            onMouseLeave={() => handleMouseLeave('facility')}
          >
            <button
              className="text-lg text-white hover:text-gray-300 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {t('navbar.facility')}
            </button>
            {openDropdowns['facility'] && (
              <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20 dropdown-menu">
                <Link
                  to="/map"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => dispatch(mouseClick())}
                >
                  {t('navbar.map')}
                </Link>
                <Link
                  to="/facility"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => dispatch(mouseClick())}
                >
                  {t('navbar.table')}
                </Link>
              </div>
            )}
          </div>

          <Link to="/dictionary" className="text-lg text-white hover:text-gray-300">
            {t('navbar.dictionary')}
          </Link>
          <Link to="/about" className="text-lg text-white hover:text-gray-300">
            <span className="whitespace-nowrap">{t('navbar.about')}</span>
          </Link>

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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20 dropdown-menu">
                  <button
                    onClick={handleDisconnect}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    {t('navbar.signOut')}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-1 border border-white rounded-full bg-gff-green px-1 h-8">
            <button
              className={`px-2 text-xs h-6 rounded-full transition-colors duration-200 ${
                currentLanguage === 'en'
                  ? 'bg-white text-gff-green font-semibold'
                  : 'text-white hover:bg-white/20'
              }`}
              onClick={switchToEnglish}
            >
              EN
            </button>
            <button
              className={`px-2 text-xs h-6 rounded-full transition-colors duration-200 ${
                currentLanguage === 'fr'
                  ? 'bg-white text-gff-green font-semibold'
                  : 'text-white hover:bg-white/20'
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
