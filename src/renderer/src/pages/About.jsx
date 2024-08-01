import { useState } from 'react'

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
      <div className="flex-grow px-5 py-8 mx-auto max-w-4xl text-gray-800">
        <section className="header text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Overview</h1>
        </section>

        <section className="content mt-10">
          <p className="text-xl leading-relaxed text-gray-600">
            Welcome to the FASTR Data Downloader, your go-to solution for easily extracting data
            from DHIS-2 data systems. Whether you are a health ministry official, researcher, NGOs,
            or donor agency, the FASTR Data Downloader is designed to facilitate a streamlined
            process for downloading DHIS2 data.
          </p>
        </section>

        <section className="contact-info mt-10">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-xl text-gray-600">
            If you have any questions or need support, please don't hesitate to reach out:
          </p>
          <ul className="list-none">
            <li>
              Email:{' '}
              <a href="mailto:fastr@worldbank.org" className="text-blue-500 hover:underline">
                fastr@worldbank.org
              </a>
            </li>
            <li>Phone: (123) 456-7890</li>
          </ul>
        </section>

        <section className="contact-form mt-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">Send us a message</h2>
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
        </section>
      </div>
    </div>
  )
}

export default AboutPage
