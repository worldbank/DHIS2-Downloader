import { useState } from 'react'
import { Accordion, AccordionGroup } from '../components/Accordion'

const AboutPage = () => {
  const [emailContent, setEmailContent] = useState('')

  const handleEmailChange = (event) => {
    setEmailContent(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const email = 'fastr@worldbank.org'
    const subject = encodeURIComponent('Support Request')
    const body = encodeURIComponent(emailContent)
    window.open(`mailto:${email}?subject=${subject}&body=${body}`)
  }

  return (
    <div className="about-page flex flex-col min-h-screen">
      <div className="flex-grow mx-auto max-w-4xl px-5 py-8">
        <section className="mb-12 text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900">Overview</h1>
        </section>

        <section className="content mt-10">
          <p className="text-xl leading-relaxed text-gray-600">
            Welcome to the FASTR DHIS2 Data Downloader, your go-to solution for easily extracting
            data from DHIS2 data systems. Whether you are a health ministry official, researcher,
            NGOs, or donor agency, the FASTR DHIS2 Data Downloader is designed to facilitate a
            streamlined process for downloading DHIS2 data.
          </p>
        </section>

        <section className="feature-info mt-10">
          <h2 className="text-2xl font-medium text-gray-800 mb-6">Features</h2>
          <AccordionGroup>
            <Accordion title="Downloading Data from DHIS2">
              <p className="mb-4">
                Download DHIS2 data by selecting date ranges, data elements/indicators, organization
                levels, units, and disaggregated dimensions. Data is downloaded in CSV format.
              </p>
              Using the FASTR DHIS2 Data Downloader requires:
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                <li>URL of the DHIS2 instance</li>
                <li>Valid username</li>
                <li>Valid password</li>
              </ul>
              <p className="mb-4 text-sm">
                Note: FASTR DHIS2 Data Downloader is not responsible for registering account for any
                DHIS2 system and can only access to DHIS2 systems for which you have already
                processed valid credentials. The Downloader will not transmit or store your DHIS2
                credentials to any places other than your laptop.
              </p>
            </Accordion>
            <Accordion title="Data Dictionary">
              <p className="mb-4">
                Search for data elements/indicators by name or JSON ID. Access additional metadata
                and download it as a CSV file.
              </p>
            </Accordion>
            <Accordion title="Managing Download History">
              <p className="mb-4">
                Record successful downloads, add notes, and quickly re-download past records. Option
                to keep or erase history upon logging out.
              </p>
            </Accordion>
          </AccordionGroup>
        </section>

        <section className="Resources-info mt-10">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">Additional Resources</h2>
          <p>
            Learn more about how to use the FASTR DHIS2 Data Downloader by visiting our{' '}
            <a
              href="https://gffklportal.org/"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline"
            >
              Training Resources
            </a>
            .
          </p>
          <p>
            The code is accessible via{' '}
            <a
              href="https://github.com/ccxzhang/dhis2-downloader"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline"
            >
              GitHub
            </a>{' '}
            under BSD-2 License.
          </p>
        </section>

        <section className="team-info mt-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Team</h2>
          <p>
            The FASTR DHIS2 Data Downloader was developed by the Results and Learning team at the
            Global Financing Facility for Women, Children and Adolescents (GFF). The Frequent
            Assessments and System Tools for Resilience (FASTR) initiative, aims to enable
            rapid-cycle monitoring for strengthening PHC systems and improving RMNCAH-N outcomes
            through the timely and high-frequency analysis and use of data.
          </p>
        </section>

        <section className="contact-info mt-10 flex flex-col md:flex-row">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-gray-700">For support feedbacks or inquiries, contact us at:</p>
            <ul className="list-none m-4">
              <li>
                Email:{' '}
                <a href="mailto:fastr@worldbank.org" className="text-blue-500 hover:underline">
                  FASTR@worldbank.org
                </a>
              </li>
              <li>Phone: (123) 456-7890</li>
            </ul>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                className="w-full p-4 text-gray-700 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                rows="4"
                placeholder="Type your message here..."
                value={emailContent}
                onChange={handleEmailChange}
              ></textarea>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Email
              </button>
            </form>
          </div>
        </section>

        {/* Acknowledgements */}
        <section>
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">Acknowledgements</h2>
          <p>
            We would like to thank Damola Sheriff Olajide with the West African Health Organization
            who provided the software prototype for the FASTR DHIS2 Data Downloader.
          </p>
        </section>
      </div>
    </div>
  )
}

export default AboutPage
