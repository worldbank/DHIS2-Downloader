# DHIS2 Data Downloader

## Introduction

The DHIS2 (District Health Information Software 2) Data Downloader is a React-based Electron application that allows users to connect to a DHIS2 instance, select dimensions, periods, organization units and levels, and download respective data from DHIS2 servers.

### Features

- **Downloading DHIS2 Data** - The downloader allows downloading HMIS data with selected date ranges, data elements, organization levels, organization units, and disaggregated dimensions.

- **HMIS Data Dictionary**: The downloader allows users to search the relevant terms and get the 11-letter JSON ID for Data Elements, Indicators, and Category Combos. Additionally, it converts the JSON IDs to readable names for Indicators when the numerator and denominator are available.

- **Manage Downloading History**: The downloader can record the parameters of successful downloads and allows users to add notes for each downloading record, fill in parameters, and quickly re-download past downloads. Additionally, the user could select to keep or erase histories when logging out.

- **Access Facility Information**: The facility table feature offers a list of all health facilities registered in the DHIS2 system and key attributes, which can be exported as a CSV file. Additionally, the facility map feature allows you to view all facilities with GPS coordinates in a map format.

## Build on Your Desktop

```bash
$ git clone https://github.com/worldbank/DHIS2-Downloader
$ cd dhis2-downloader
$ npm install

# Start the app
$ npm run start

# For windows
$ npm run build:win
# For macOS
$ npm run build:mac
# For Linux
$ npm run build:linux
```

## Acknowledgements

We would like to thank Damola Sheriff Olajide with the West African Health Organization who provided the software [prototype](https://github.com/dolajide/dhis2-poc) for the FASTR Data Downloader.
