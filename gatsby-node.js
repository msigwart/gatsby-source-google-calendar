/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */
const {google} = require("googleapis");

/**
 * You can uncomment the following line to verify that
 * your plugin is being loaded in your site.
 *
 * See: https://www.gatsbyjs.com/docs/creating-a-local-plugin/#developing-a-local-plugin-that-is-outside-your-project
 */
exports.onPreInit = () => {
  require("dotenv").config({
    path: `.env.${process.env.NODE_ENV}`,
  });
}

/**
 * Callback for oAuth2 authentication
 * When the user authorizes the site this endpoints gets called either with an error response:
 *
 * http://localhost:8000/oAuthCallback?error=access_denied
 *
 * or the a code:
 *
 * http://localhost:8000/oAuthCallback?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
 *
 * The code is then used to request an access and refresh token via the oAuth2Client.
 */
exports.onCreateDevServer = ({ app }) => {
  const oAuth2Client = createOAuth2Client();


  app.get('/oAuthCallback', async function (req, res) {
    const error = req.query.error;
    if (error) {
      res.send(error);
      return;
    }
    const code = req.query.code;
    try {
      const tokens = (await oAuth2Client.getToken(code)).tokens;
      console.info(
`
(Plugin gatsby-source-google-calendar)
Successfully authorized site for Google Calendar API.
Store the following values in your .env files then restart gatsby develop:

GOOGLE_ACCESS_TOKEN=${tokens.access_token}
GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}
`     );
      res.send('Successfully authorized.')
    } catch (error) {
      res.send(error);
      console.warn(`Failed to authorize site for Google Calendar API (${JSON.stringify(error)})`);
    }
  });
}

exports.sourceNodes = async ({
                               actions,
                               createContentDigest,
                               createNodeId,
                               getNodesByType,
                             },
                             pluginOptions
) => {
  const { createNode } = actions

  // Authorize a client with credentials, then query events via Google Calendar API.
  const oAuth2Client = createOAuth2Client();
  checkAuthorization(oAuth2Client);
  const calendars = await getCalendars(oAuth2Client, pluginOptions.calendarIds);
  // const events = await getEvents(oAuth2Client, pluginOptions.calendarId, pluginOptions.options);

  // constants for your GraphQL Calendar and CalendarEvent types
  const CALENDAR_NODE_TYPE = `Calendar`
  const EVENT_NODE_TYPE = `CalendarEvent`

  if (!calendars.length) {
    throw 'No calendars found';
  }

  // loop through data, query events and create Gatsby nodes for calendar and events
  for (let calendar of calendars) {
    const calendarNodeId = createNodeId(`${CALENDAR_NODE_TYPE}-${calendar.id}`);
    const queryParams = { ...pluginOptions };
    const events = await getEvents(oAuth2Client, calendar.id, queryParams);
    if (!events.length) {
      console.warn(`gatsby-source-google-calendar: no events found (calendar ${calendar.id})`);
    }
    const children = [];
    events.forEach(event => {
      const eventNodeId = createNodeId(`${EVENT_NODE_TYPE}-${event.id}`);
      createNode({
        ...event,
        id: eventNodeId,
        parent: calendarNodeId,
        children: [],
        internal: {
          type: EVENT_NODE_TYPE,
          content: JSON.stringify(event),
          contentDigest: createContentDigest(JSON.stringify(event)),
        },
      })
      children.push(eventNodeId);
    });
    createNode({
      ...calendar,
      id: calendarNodeId,
      parent: null,
      children: children,
      internal: {
        type: CALENDAR_NODE_TYPE,
        content: JSON.stringify(calendar),
        contentDigest: createContentDigest(JSON.stringify(calendar)),
      },
    });
  }
}


function createOAuth2Client() {
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = "http://localhost:8000/oAuthCallback";
  if (!clientSecret || !clientId) {
    throw `    No client configuration available.
    Enable the Google Calendar API by visiting:

    https://developers.google.com/calendar/quickstart/nodejs#step_1_turn_on_the

    Follow the workflow and then store Client ID and Client Secret in your .env* files as
    GOOGLE_CLIENT_ID=<client_id>
    GOOGLE_CLIENT_SECRET=<client_secret>`
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Authorize the given oAuth2Client to access Google APIs
 * @param {Object} oAuth2Client The authorization client.
 */
function checkAuthorization(oAuth2Client) {

  // If modifying these scopes, delete GOOGLE_ACCESS_TOKEN and GOOGLE_REFRESH_TOKEN values from .env files.
  const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

  // Check if the API access token exists
  let access_token = process.env.GOOGLE_ACCESS_TOKEN;
  let refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
  if (!access_token) {

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    throw `    Authorize this app by visiting this url:
    
${authUrl}
    `
  } else {
    oAuth2Client.setCredentials({ access_token, refresh_token });
  }
}


/**
 * Lists the calendars of the user.
 * By default all calendars of the user are returned.
 * Optionally an array containing the IDs of the Google calendars to be queried can be specified.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {Array} calendarIds An array containing the IDs of the Google calendars to retrieve
 */
async function getCalendars(auth, calendarIds = []) {
  const calendar = google.calendar({version: 'v3', auth});
  if (calendarIds.length) {
    return await Promise.all(calendarIds.map(async calendarId => (await calendar.calendarList.get({
      calendarId
    })).data));
  }
  return (await calendar.calendarList.list()).data.items;
}

/**
 * Lists the events of the calendar with the provided calendarId.
 * Various options can be passed to e.g.
 * - only return events starting from a minimum time
 * - limit the number of returned events
 * - order the returned events
 * For a full list of options visit
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} calendarId An ID of a Google Calendar.
 * @param {Object} queryParams Options to be passed to the calendar event list query
 */
async function getEvents(auth, calendarId, queryParams) {
  const calendar = google.calendar({version: 'v3', auth});
  return (await calendar.events.list({
    calendarId,
    ...queryParams
  })).data.items;
}

