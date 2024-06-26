import { Link } from 'react-router-dom'
import fastrLogo from '../assets/FASTR_Logo_White_En.png'

const NavBar = ({ accessToken, username, handleDisconnect }) => {
  return (
    <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-blue-500 py-2 dark:bg-neutral-800">
      <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        <div className="flex w-16 h-12 max:w-20 max:h-15">
          <img src={fastrLogo} className="object scale-down" alt="FASTR Logo" />
        </div>
        <span className="self-center text-2xl font-semibold whitespace-nowrap text-white dark:text-neutral-400">
          DHIS2 Data Downloader
        </span>
        <div className="flex flex-row items-center gap-5 mt-3 sm:justify-end sm:mt-0 sm:ps-5">
          <Link to="/home" className="text-lg text-white">
            Home
          </Link>
          <Link
            to="/about"
            className="text-lg text-gray-300 hover:text-white dark:text-neutral-400 dark:hover:text-neutral-500"
          >
            About
          </Link>
          {accessToken && (
            <button
              onClick={handleDisconnect}
              className="text-lg text-gray-300 hover:text-white dark:text-neutral-400 dark:hover:text-neutral-500"
            >
              Sign out
            </button>
          )}
          <span className="font-medium text-gray-300 dark:text-neutral-400">{username}</span>
        </div>
      </nav>
    </header>
  )
}
export default NavBar
