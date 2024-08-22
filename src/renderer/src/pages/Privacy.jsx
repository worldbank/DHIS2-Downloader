import React from 'react'

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-5">
      <h1 className="text-xl font-bold text-center mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-2">Last updated: [Date]</p>
      <h2 className="text-lg font-semibold mb-3">Introduction</h2>
      <p className="mb-3">
        Thank you for choosing to use FASTR DHIS2 Downloader ("We", "us", "the Downloader"). We take
        your privacy seriously. This Privacy Policy explains the types of information we collect
        through your use of the Downloader, and how we ensure your privacy is maintained.
      </p>
      <h2 className="text-lg font-semibold mb-3">Information We Collect</h2>
      <p className="mb-3">
        We <b>do not collect or store</b> any personal information from users. The application
        serves solely as a conduit for data transmission from DHIS2 servers to your device.
      </p>
      <h2 className="text-lg font-semibold mb-3">Data Transmission</h2>
      <p className="mb-3">
        While we do not collect personal information, we facilitate the downloading of data from
        DHIS2 servers. Some data is tempoararily stored, processed, or analyzed by the application
        locally, and we ensure that all transmissions are secure and encrypted using the latest
        protocols.
      </p>
      <h2 className="text-lg font-semibold mb-3">Security</h2>
      <p className="mb-3">
        We are committed to ensuring the security of data transmissions. We implement a variety of
        security measures to maintain the safety of your data during transmission, including
        encryption and secure channels.
      </p>
      <h2 className="text-lg font-semibold mb-3">Changes to This Privacy Policy</h2>
      <p className="mb-3">
        We may update our Privacy Policy from time to time. We will notify you of any changes by
        posting the new Privacy Policy on this page. You are advised to review this Privacy Policy
        periodically for any changes.
      </p>
    </div>
  )
}

export default PrivacyPolicy
