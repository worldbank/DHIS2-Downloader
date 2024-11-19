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
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
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
              <p style={{ fontStyle: 'italic' }} className="mb-4 text-sm">
                Note: The FASTR DHIS2 Data Downloader does not handle DHIS2 account registration. It
                can only access DHIS2 systems for which you have valid credentials. The Downloader
                will not transmit or store your DHIS2 credentials anywhere other than on your
                laptop.
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
            <Accordion title="Accessing Facility Information">
              <p className="mb-4">
                The facility table feature offers a list of all health facilities registered in the
                DHIS2 system, along with key attributes, which can be exported as a CSV file.
                Additionally, the facility map feature allows you to view all facilities with GPS
                coordinates in a map format.
              </p>
            </Accordion>
          </AccordionGroup>
        </section>
        <section className="faq-info mt-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Frequently Asked Questions (FAQ)
          </h2>
          <AccordionGroup>
            <Accordion title="Why Do I Need to Select a Chunk Size?">
              <p className="mb-4">
                Chunk size refers to how many periods of data are grouped together. For example, if
                you are downloading facility-level monthly out-patient visits from January to
                December 2021, and you select the 3 as the chunk size, which means the Downloader
                will group 3 months together as a single request and make four requests in total to
                finish the download. Selecting a chunk size helps split large datasets into
                manageable parts, ensuring faster processing, easier downloads, and reduced risk of
                system overload.{' '}
                <b>
                  Always select the appropriate chunk size based on your country's DHIS2 system
                  situations.
                </b>
              </p>
            </Accordion>
            <Accordion title="Why did the download fail, and how can I find out what went wrong?">
              <p className="mb-4">
                The data downloader produces a log of errors. Here are some common errors with an
                explanation and suggestions for solutions.
              </p>
              <p className="mb-4">
                <strong>Error: "Cannot read properties of null (reading 'textContent')" </strong>
                <br />
                <em>Cause:</em> This usually happens when the requested time periods or indicators
                are missing. This could mean there is no data stored in DHIS2 for a specific
                indicator in a specific month or time period. To troubleshoot:
              </p>
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                <li>
                  Make sure you’ve selected the correct time periods and data indicators before
                  starting the download.
                </li>
                <li>
                  This error won’t interrupt the data download process. When a request fails, the
                  system will continue, and you can review any failed requests once the download is
                  complete.
                </li>
              </ul>
              <p className="mb-4">
                <strong>Error: &quot;HTTP Status 500 – Internal Server Error&quot;</strong>
                <br />
                <em>Cause:</em> This error usually means there’s an issue with the server, often due
                to a disconnection. To troubleshoot:
              </p>
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                <li>
                  Ensure all required data fields (like time periods and data elements/indicators)
                  are selected.
                </li>
                <li>Verify that your login credentials are correct.</li>
                <li>Check that the server is up and not experiencing any issues.</li>
              </ul>
            </Accordion>

            <Accordion title="Why do I need to change the filename even though it says the file will be replaced?">
              <p className="mb-4">
                The downloader splits large requests into smaller parts and then combines them into
                a single file. Even if it says it’s replacing an existing file with the same name,
                the Data Downloader actually adds new data to that file. To avoid confusion, give
                each new download a unique name to ensure the data is correctly added.
              </p>
            </Accordion>
            <Accordion title="How can I avoid download timeouts with large data requests?">
              <p className="mb-4">
                Downloads have a 1-hour time limit, meaning requests that take longer than 1 hour
                will automatically time out. To avoid this, split your requests into smaller batches
                to ensure each download is completed within the time frame. Each DHIS2 system
                operates uniquely, with variations in data download speeds. You may need to
                experiment to find the optimal data volume that can be requested in a single
                download.
              </p>
            </Accordion>
            <Accordion title="How much data can I download into an Excel file?">
              <p className="mb-4">
                Excel can handle around 1 million rows, so if you’re downloading large datasets
                (e.g., data from thousands of facilities across multiple months), you might reach
                Excel’s limit. To manage this, try downloading the data in smaller batches. If you
                exceed Excel’s capacity, you can still open the CSV file in statistical software to
                access the full dataset.
              </p>
            </Accordion>
          </AccordionGroup>
        </section>

        <section className="Resources-info mt-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional Resources</h2>
          <p>
            Learn more about how to use the FASTR DHIS2 Data Downloader by visiting our{' '}
            <a
              href="https://data.gffportal.org/key-theme-pages/rmncah-n-service-use-monitoring"
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
              href="https://github.com/worldbank/dhis2-downloader"
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
            <p className="text-gray-700">For support, feedback, or inquiries, contact us at:</p>
            <ul className="list-none m-4">
              <li>
                Email:{' '}
                <a href="mailto:fastr@worldbank.org" className="text-blue-500 hover:underline">
                  FASTR@worldbank.org
                </a>
              </li>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acknowledgements</h2>
          <p className="text-sm">
            We would like to thank Damola Sheriff Olajide with the West African Health Organization
            who provided the software prototype for the FASTR DHIS2 Data Downloader.
          </p>
        </section>
      </div>
    </div>
  )
}

export default AboutPage
