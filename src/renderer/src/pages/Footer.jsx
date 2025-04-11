import WBGLogo from '../assets/WBG-SupportedBy-horizontal-white-web.png'
import GFFLogo from '../assets/GFF_Logo_White_En.png'
import FASTRLogo from '../assets/FASTR_White_Horiz.png'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gff-green text-white p-5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="left-logo flex flex-wrap space-x-8">
          <a
            href="https://data.gffportal.org/key-theme/FASTR"
            target="_blank"
            rel="noreferrer"
            className="block hover:underline"
          >
            <img src={FASTRLogo} alt="FASTR Logo" className="h-12" />
          </a>
          <a
            href="https://www.globalfinancingfacility.org/"
            target="_blank"
            rel="noreferrer"
            className="block hover:underline"
          >
            <img src={GFFLogo} alt="Global Financing Facility" className="h-12 mr-2" />
          </a>
          <a
            href="https://www.worldbank.org/en/home"
            target="_blank"
            rel="noreferrer"
            className="block hover:underline"
          >
            <img src={WBGLogo} alt="Supported by WBG Logo" className="h-12 mr-2" />
          </a>
        </div>

        <div className="right-side flex items-center space-x-10">
          <a
            href="https://www.worldbank.org/en/about/legal/terms-and-conditions"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-300"
          >
            Terms & Conditions
          </a>
          <Link to="/privacy" className="hover:text-gray-300">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
