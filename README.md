# gatsby-source-google-calendar

A Gatsby plugin to source events from a user's Google Calendars. 

## 🚀 Getting started

To get started using the plugin follow these steps:

### 1. Install plugin

```shell
npm install @msigwart/gatsby-source-google-calendar
```

### 2. Include the plugin in `gatsby-config.js`

```javascript
module.exports = {
  plugins: [
    // other gatsby plugins
    // ...
    {
      resolve: `@msigwart/gatsby-source-google-calendar`,
      options: {
        calendarIds: [
          'abc...1234@group.calendar.google.com',
        ],
        // options to retrieve the next 10 upcoming events
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      }
    },
  ],
}
```

All options are optional. 
Specify the IDs of all the calendars you wish to query in the array `calendarIds`.
If you omit this field, it will query all calendars of the authenticated Google user.
You can further specify fields to filter the events of the calendars 
(e.g. minimum start/maximum end date, number of returned results, etc.).
A full list of options can be found [here](https://developers.google.com/calendar/v3/reference/events/list).

### 3. Authorize with Google

Before you can access the Google Calendar API, you have to 
[authorize your site with Google](https://developers.google.com/identity/protocols/oauth2/web-server).

#### Enable Google Calendar API for your project
To enable an API for your project:

1. [Open the API Library](https://console.developers.google.com/apis/library) in the Google API Console.
2. If prompted, select a project, or create a new one.
3. The API Library lists all available APIs, grouped by product family and popularity. If the API you want to enable isn't visible in the list, use search to find it, or click View All in the product family it belongs to.
4. Select the API you want to enable, then click the Enable button.
5. If prompted, enable billing.
6. If prompted, read and accept the API's Terms of Service.

#### Create authorization credentials
1. Go to the [Credentials page](https://console.developers.google.com/apis/credentials).
2. Click **Create credentials > OAuth client ID**.
3. Select the **Web application** application type.
4. Fill in the form and click **Create**. 
When prompted for a redirect URI, type in **ht<span>tp://</span>localhost:8000/oAuthCallback**.
The redirect URI is the endpoint to which the OAuth 2.0 server can send responses.
It is setup by the plugin automatically.
5. Store the resulting client configuration (Client ID and Client Secret) in your .env files in the 
root directory of your project:

```text
GOOGLE_CLIENT_ID=111122223333-123abcdef34567ghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=123ABC_987xyz
```

#### Retrieve API tokens
Once you've stored the client credentials, execute `gatsby develop`. 
When first executed, the plugin throws the following error:

```text
"gatsby-source-google-calendar" threw an error while running the sourceNodes lifecycle:

    Authorize this app by visiting this url:

https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly&response_type=code&client_id=111122223333-123abcdef34567ghijklmnop.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2FoAuthCallback
```

Visit the displayed URL and follow the steps to complete the authorization.
On successful authorization, the plugin prints out the access and refresh tokens to the console:

```text
Successfully authorized app for Google Calendar API.
Store the following values in your .env files then restart gatsby develop:

GOOGLE_ACCESS_TOKEN=abc...123
GOOGLE_REFRESH_TOKEN=123...abc
```

Store these values in your `.env` files, then restart `gatsby develop`.
The plugin should now query the events from Google Calendar.

> **Important:** You should never expose API keys to your source control
> so you should not commit `.env` files to your source control 
> (make sure they are listed in `.gitignore`). 
> Services like Netlify provide a secure way to [include environment variables
> for your builds](https://www.netlify.com/docs/continuous-deployment/#build-environment-variables)).

### 4. Accessing calendars and events in your site
To access the sourced calendars and events in your site write a GraphQL query like this:
```graphql
query MyCalendarQuery {
  allCalendar {
    edges {
      node {
        summary
        description
        childrenCalendarEvent {
          summary
          start {
            date
            dateTime
          }
          description
          end {
            date
            dateTime
          }
        }
      }
    }
  }
}
```
This will return all calendars (with summary and description) with their 
respective events (`childrenCalendarEvent`).

## How to contribute
Contributions are very welcome!
File a bug report or submit feature requests through the [issue tracker](https://github.com/msigwart/gatsby-source-google-calendar/issues). 
Of course, you can also just submit a pull request 😉

## Licence
This project is licensed under the [MIT License](LICENSE).
