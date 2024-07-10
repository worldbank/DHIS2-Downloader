import { useState } from 'react'
import fastrLogo from '../assets/FASTR_Logo_White_En.png'

const Versions = () => {
  const [versions] = useState(window.electron.process.versions)

  return (
    <>
      <ul className="versions">
        <li className="electron-version">Electron v{versions.electron}</li>
        <li className="chrome-version">Chromium v{versions.chrome}</li>
        <li className="node-version">Node v{versions.node}</li>
      </ul>
      <div className="relative w-10 h-10 md:w-16 md:h-16">
        <img src={fastrLogo} className="rounded-lg" />
      </div>
    </>
  )
}

export default Versions
