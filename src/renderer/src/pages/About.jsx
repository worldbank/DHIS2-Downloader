import { useState } from 'react'
import { Accordion, AccordionGroup } from '../components/Accordion'
import { useTranslation, Trans } from 'react-i18next'

const AboutPage = () => {
  const { t } = useTranslation()
  const [emailContent, setEmailContent] = useState('')

  const handleEmailChange = (event) => {
    setEmailContent(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const email = t('aboutPage.contact.email')
    const subject = encodeURIComponent('Support Request')
    const body = encodeURIComponent(emailContent)
    window.open(`mailto:${email}?subject=${subject}&body=${body}`)
  }

  return (
    <div className="about-page flex flex-col min-h-screen">
      <div className="flex-grow mx-auto max-w-4xl px-5 py-8">
        <section className="mb-12 text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900">{t('aboutPage.overviewTitle')}</h1>
        </section>

        <section className="content mt-10">
          <p className="text-xl leading-relaxed text-gray-600">{t('aboutPage.welcomeText')}</p>
        </section>

        <section className="feature-info mt-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('aboutPage.features.title')}
          </h2>
          <AccordionGroup>
            <Accordion title={t('aboutPage.features.downloadingData.title')}>
              <p className="mb-4">{t('aboutPage.features.downloadingData.description')}</p>
              <p>{t('aboutPage.features.downloadingData.requirements')}</p>
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                {t('aboutPage.features.downloadingData.requirementsList', {
                  returnObjects: true
                }).map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
              <p style={{ fontStyle: 'italic' }} className="mb-4 text-sm">
                {t('aboutPage.features.downloadingData.note')}
              </p>
            </Accordion>

            <Accordion title={t('aboutPage.features.dataDictionary.title')}>
              <p className="mb-4">{t('aboutPage.features.dataDictionary.description')}</p>
            </Accordion>

            <Accordion title={t('aboutPage.features.downloadHistory.title')}>
              <p className="mb-4">{t('aboutPage.features.downloadHistory.description')}</p>
            </Accordion>

            <Accordion title={t('aboutPage.features.facilityInfo.title')}>
              <p className="mb-4">{t('aboutPage.features.facilityInfo.description')}</p>
            </Accordion>
          </AccordionGroup>
        </section>

        <section className="faq-info mt-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('aboutPage.faq.title')}</h2>
          <AccordionGroup>
            <Accordion title={t('aboutPage.faq.q1.question')}>
              <p className="mb-4">{t('aboutPage.faq.q1.answer')}</p>
            </Accordion>
            <Accordion title={t('aboutPage.faq.q2.question')}>
              <p className="mb-4">{t('aboutPage.faq.q2.answer1')}</p>
              <p className="mb-4">{t('aboutPage.faq.q2.answer2')}</p>
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                {t('aboutPage.faq.q2.requirements', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="mb-4">{t('aboutPage.faq.q2.answer3')}</p>
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                {t('aboutPage.faq.q2.serverIssues', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </Accordion>
            <Accordion title={t('aboutPage.faq.q3.question')}>
              <p className="mb-4">{t('aboutPage.faq.q3.answer')}</p>
            </Accordion>
            <Accordion title={t('aboutPage.faq.q4.question')}>
              <p className="mb-4">{t('aboutPage.faq.q4.answer')}</p>
            </Accordion>
            <Accordion title={t('aboutPage.faq.q5.question')}>
              <p className="mb-4">{t('aboutPage.faq.q5.answer')}</p>
            </Accordion>
          </AccordionGroup>
        </section>

        <section className="resources-info mt-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('aboutPage.resources.title')}
          </h2>
          <p>
            <Trans
              i18nKey="aboutPage.resources.description"
              components={{
                trainingLink: (
                  <a
                    href="https://scribehow.com/page/FASTR_data_downloader_tutorial_page__lr13_gEiRuehOe57UwyyBA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  />
                ),
                githubLink: (
                  <a
                    href="https://github.com/worldbank/DHIS2-Downloader"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  />
                ),
                br: <br />
              }}
            />
          </p>
        </section>

        <section className="contact-info mt-10 flex flex-col md:flex-row">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('aboutPage.contact.title')}
            </h2>
            <p className="text-gray-700">{t('aboutPage.contact.contactText')}</p>
            <ul className="list-none m-4">
              <li>
                {t('aboutPage.contact.emailLabel')}:{' '}
                <a
                  href={`mailto:${t('aboutPage.contact.email')}`}
                  className="text-blue-500 hover:underline"
                >
                  {t('aboutPage.contact.email')}
                </a>
              </li>
            </ul>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('aboutPage.contact.sendMessageTitle')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                className="w-full p-4 text-gray-700 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                rows="4"
                placeholder={t('aboutPage.contact.messagePlaceholder')}
                value={emailContent}
                onChange={handleEmailChange}
              ></textarea>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('aboutPage.contact.sendButton')}
              </button>
            </form>
          </div>
        </section>

        <section className="acknowledgements mt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('aboutPage.acknowledgements.title')}
          </h2>
          <p className="text-sm">{t('aboutPage.acknowledgements.description')}</p>
        </section>
      </div>
    </div>
  )
}

export default AboutPage
