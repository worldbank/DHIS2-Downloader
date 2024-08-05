import WBGLogo from '../assets/WBG-SupportedBy-horizontal-white-web.png'
import GFFLogo from '../assets/GFF_Logo_White_En.png'

const Footer = () => {
  return (
    <footer className="bg-gff-green text-white p-5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="left-logo flex flex-nowrap">
          <a
            href="https://www.globalfinancingfacility.org/"
            target="_blank"
            rel="noreferrer"
            className="block hover:underline"
          >
            <img src={GFFLogo} alt="Global Financing Facility" className="h-12 mr-4" />
          </a>
          <a
            href="https://www.worldbank.org/en/home"
            target="_blank"
            rel="noreferrer"
            className="block hover:underline"
          >
            <img src={WBGLogo} alt="Supported by WBG Logo" className="h-12 mr-4" />
          </a>
        </div>
        <div className="right-side flex items-center space-x-10">
          <a
            href="https://github.com/ccxzhang/dhis2-downloader"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-300"
          >
            Resources
          </a>
          <a
            href="https://www.worldbank.org/en/about/legal/terms-and-conditions"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-300"
          >
            Terms & Conditions
          </a>
          <a href="#" className="hover:text-gray-300">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer