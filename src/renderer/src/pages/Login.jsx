import { useSelector, useDispatch } from 'react-redux'
import { setDhis2Url, setUsername, setPassword, connect } from '../reducers/authReducer'
import Tooltip from '../components/Tooltip'
import { useTranslation } from 'react-i18next'

const Login = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { dhis2Url, username, password } = useSelector((state) => state.auth)

  const handleConnect = async (event) => {
    event.preventDefault()
    dispatch(connect(dhis2Url, username, password))
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-grey-100">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-center text-black">{t('login.title')}</h3>
        <form onSubmit={handleConnect}>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">
                {t('login.dhis2UrlLabel')}
                <Tooltip>
                  <p dangerouslySetInnerHTML={{ __html: t('login.dhis2UrlTooltip') }} />
                </Tooltip>
              </label>
              <input
                type="text"
                placeholder={t('login.dhis2UrlPlaceholder')}
                value={dhis2Url}
                onChange={(e) => dispatch(setDhis2Url(e.target.value))}
                className="w-full px-4 py-2 border border-teal-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2">{t('login.usernameLabel')}</label>
              <input
                type="text"
                placeholder={t('login.usernamePlaceholder')}
                value={username}
                onChange={(e) => dispatch(setUsername(e.target.value))}
                className="w-full px-4 py-2 border border-teal-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2">{t('login.passwordLabel')}</label>
              <input
                type="password"
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => dispatch(setPassword(e.target.value))}
                className="w-full px-4 py-2 border border-teal-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
              >
                {t('login.connectButton')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
