# Dream Journal App

## Well-formatted, cloud-based Dream Journal

- Records daily dream journal entries into plain-text, well-formatted JSON format
- Easy to search and gain insight into your dream signs
- Safely stored into your Google Drive
- Import wizard to convert your existing dreams into clean, searchable format

## Table of Contents

- [Dream Journal App](#dream-journal-app)
	- [Well-formatted, cloud-based Dream Journal](#well-formatted-cloud-based-dream-journal)
	- [Table of Contents](#table-of-contents)
	- [Features](#features)
	- [Live Demo](#live-demo)
	- [Application Screens](#application-screens)
	- [Setup and Installation](#setup-and-installation)
	- [Usage](#usage)
	- [Credits](#credits)
	- [License](#license)

## Features

- Record daily dream journal entries with automatic timestamping.
- Store entries as structured JSON data for easy processing and analysis.
- Import existing dreams from other formats (e.g., text files) into the system.
- Search and filter dreams based on date, dream signs, or keywords.
- Secure cloud-based storage using Google Drive integration.

## Live Demo

Check out the live version of the app hosted on Google Firebase:

[Brain Cloud Dream Journal](https://brain-cloud-dream-journal.web.app)

## Application Screens

![Home Screen of Dream Journal App](https://raw.githubusercontent.com/gitbrent/dream-journal-app/master/src/img/app-screencap-home.png)
![Modify Journal Entry Screen](https://raw.githubusercontent.com/gitbrent/dream-journal-app/master/src/img/app-screencap-modify.png)
![Import Wizard Screen](https://raw.githubusercontent.com/gitbrent/dream-journal-app/master/src/img/app-screencap-import.png)

## Setup and Installation

To run this project locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/gitbrent/dream-journal-app.git
   cd dream-journal-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables for Google Drive integration:

   - Create a `.env` file at the root of your project with the following variables:

    ```
    REACT_APP_GOOGLE_CLIENT_ID=your-client-id
    REACT_APP_GOOGLE_API_KEY=your-api-key
    ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Build the app for production:

   ```bash
   npm run build
   ```

## Usage

1. **Sign in with Google**: Log in securely with your Google account to access your dream journal data.
2. **Add a New Entry**: Click on 'Add Entry' to create a new dream entry.
3. **Modify Existing Entries**: Select an entry from the list to edit or update details.
4. **Search and Filter**: Use the search bar to find specific entries by date or dream signs.
5. **Import Dream Data**: Use the import wizard to upload and convert existing dream logs.

All data is automatically saved to your Google Drive for safe and secure access.

## Credits

- This app is built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/).
- Firebase hosting and Google Drive integration are powered by [Google Cloud](https://cloud.google.com/).
- Built using the [Vite](https://vitejs.dev) dev environment (originally create-react-app).
- App icon created by [Nhor Phai](https://www.flaticon.com/authors/nhor-phai) from [Flaticon](https://www.flaticon.com/), licensed under [Creative Commons BY 3.0](http://creativecommons.org/licenses/by/3.0/).

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/gitbrent/dream-journal-app/blob/master/LICENSE) file for more information.

&copy; 2019-present [Brent Ely](https://github.com/gitbrent)
