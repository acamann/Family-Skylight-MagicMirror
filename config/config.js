/* MM Config
 *
 * For more information on how you can configure this file
 * see https://docs.magicmirror.builders/configuration/introduction.html
 * and https://docs.magicmirror.builders/modules/configuration.html
 *
 * You can use environment variables using a `config.js.template` file instead of `config.js`
 * which will be converted to `config.js` while starting. For more information
 * see https://docs.magicmirror.builders/configuration/introduction.html#enviromnent-variables
 */
let config = {
	address: "0.0.0.0",	// Address to listen on, can be:
							// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
							// - another specific IPv4/6 to listen on a specific interface
							// - "0.0.0.0", "::" to listen on any interface
							// Default, when address config is left out or empty, is "localhost"
	port: 8080,
	basePath: "/",	// The URL path where MagicMirror² is hosted. If you are using a Reverse proxy
									// you must set the sub path here. basePath must end with a /
	ipWhitelist: [],	// Set [] to allow all IP addresses
									// or add a specific IPv4 of 192.168.1.5 :
									// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
									// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
									// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false,			// Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "",	// HTTPS private key path, only require when useHttps is true
	httpsCertificate: "",	// HTTPS Certificate path, only require when useHttps is true

	language: "en",
	locale: "en-US",   // this variable is provided as a consistent location
			   // it is currently only used by 3rd party modules. no MagicMirror code uses this value
			   // as we have no usage, we  have no constraints on what this field holds
			   // see https://en.wikipedia.org/wiki/Locale_(computer_software) for the possibilities

	logLevel: ["INFO", "LOG", "WARN", "ERROR"], // Add "DEBUG" for even more logging
	timeFormat: 12,
	units: "imperial",

  watchTargets: [
    "css/main.css",
    "config/config.js",
    "config/config.env",
    "config/custom.css",
    "config/nav-panel.css",
    "config/calendar-common.css",
    "config/full-month-calendar.css",
    "config/weekly-calendar.css"
  ],

	modules: [
    {
      module: "MMM-pages",
      config: {
        animationTime: 0, // Instant page transitions
        modules: [
          ["MMM-CalendarExt3Journal"], // 4-Day Calendar View
          ["MMM-CalendarExt3"], // full month calendar
          ["MMM-CalendarExt3"], // full month calendar
          //"page-1": ["MMM-CalendarExt3"],        // Full Month Calendar
          //"page-2": ["MMM-Todoist"],             // Todo List
          //"page-3": ["weather"]                  // Weather View
        ],
        fixed: [
          "MMM-page-indicator" // Or your touch navigation module, set to 'top_left'
        ]
      }
    },
    {
      module: 'MMM-page-indicator',
      position: 'top_left',
      config: {
        pages: 2,
        activeBright: true,
        showPageNumberOnHover: false
      }
    },
		{
			module: "alert",
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		// {
		// 	module: "clock",
		// 	position: "bottom_bar"
		// },
		{
			module: "calendar",
			// header: "Family Calendar",
			// position: "top_left",
			config: {
				maximumNumberOfDays: 40,
        calendars: [

          // Sarah
          {
            name: "Sarah Work",
            url: "${CAL_SARAH_WORK_CALENDAR}",
            color: "#ffa033"
          },

          // Family
          {
            name: "Family",
            url: "${CAL_FAMILY_CALENDAR}",
            color: "#7b603e"
          },

          // Daniel
          {
            name: "Daniel",
            url: "${CAL_DANIEL_CALENDAR}",
            color: "#b7af5a"
          },
          {
            name: "Kapow",
            url: "${CAL_KAPOW_CALENDAR}",
            color: "#b7af5a"
          },
          {
            name: "Rough Riders",
            url: "${CAL_ROUGH_RIDERS_CALENDAR}",
            color: "#b7af5a"
          },
          
          // Luke
          {
            name: "Luke",
            url: "${CAL_LUKE_CALENDAR}",
            color: "#abcdde"
          },
          {
            name: "Mustangs",
            url: "${CAL_MUSTANGS_CALENDAR}",
            color: "#abcdde"
          },
          
          // Ben
          {
            name: "Ben",
            url: "${CAL_BEN_CALENDAR}",
            color: "#33FF57"
          },
          {
            name: "Green Ninjas",
            url: "${CAL_GREEN_NINJAS_CALENDAR}",
            color: "#33FF57"
          },
        ]
			}
		},
    {
      module: "MMM-CalendarExt3Journal",
      position: "fullscreen_below",
      config: {
        animationSpeed: 0, // Prevents module re-rendering fade cycles
        height: "100vh",
        width: "100%",
        instanceId: "weekCalendar",
        locale: 'en-US',
        //maxLaneThreshold: 4,
        hourLength: 11,
        beginHour: 12,
        staticTime: true,
        staticWeek: false,
        dayIndex: 0,
        days: 6,
        calendarSet: [], // Leave empty to pull from all default calendars
        fontSize: "16px",
        eventHeight: "22px",
        refreshInterval: 5 * 60 * 1000 // Refreshes every 5 minute
      }
    },
    {
      module: "MMM-CalendarExt3",
      position: "fullscreen_below", // Choose where this displays on your screen
      config: {
        animationSpeed: 0, // Prevents module re-rendering fade cycles
        mode: "week",
        instanceId: "fourWeekCalendar",
        locale: 'en-US',
        weekIndex: 0,
        weeksInView: 4,
        maxEventLines: 10,
        showCW: false,
        weekdayOptions: { weekday: 'short' }, // not working
        calendarMergePaths: [], // Leave empty to pull from all default calendars
        fontSize: "16px",
        eventHeight: "22px",
        refreshInterval: 5 * 60 * 1000 // Refreshes every 5 minute
      }
    },
		// {
		// 	module: "compliments",
		// 	position: "lower_third"
		// },
		// {
		// 	module: "weather",
		// 	position: "top_right",
		// 	config: {
		// 		weatherProvider: "openmeteo",
		// 		type: "current",
    //     lat: 32.95,
    //     lon: -96.71,
    //     units: "imperial"
		// 	}
		// },
		// {
		// 	module: "weather",
		// 	position: "top_right",
		// 	header: "Weather Forecast",
		// 	config: {
		// 		weatherProvider: "openmeteo",
		// 		type: "forecast",
    //     lat: 32.95,
    //     lon: -96.71,
		// 	}
		// },
		// {
		// 	module: "newsfeed",
		// 	position: "bottom_bar",
		// 	config: {
		// 		feeds: [
		// 			{
		// 				title: "New York Times",
		// 				url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
		// 			}
		// 		],
		// 		showSourceTitle: true,
		// 		showPublishDate: true,
		// 		broadcastNewsFeeds: true,
		// 		broadcastNewsUpdates: true
		// 	}
		// },
	]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") { module.exports = config; }
