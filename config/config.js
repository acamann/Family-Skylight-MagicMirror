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
    "config/weekly-calendar.css",
    "config/update-notification.css",
    "config/updates-icon.css"
  ],

	modules: [
    {
      module: "MMM-pages",
      config: {
        animationTime: 0, // Instant page transitions
        modules: [
          ["MMM-CalendarExt3Journal"], // 4-Day Calendar View
          ["MMM-CalendarExt3"], // full month calendar
          ["MMM-AnyLists"], // kids' AnyList todo lists
          ["MMM-MLBPlayoffs"] // live MLB playoffs bracket
        ],
        fixed: [
          "MMM-page-indicator", // Or your touch navigation module, set to 'top_right'
          "updatenotification", // Must stay visible on every page
          "alert", // Alert notifications should not be hidden by page changes
          "MMM-updates-icon", // Yellow update icon pinned to the bottom of the nav dock
          "MMM-ScreenSleep" // Idle timer must keep running no matter which page is showing
        ]
      }
    },
    {
      module: 'MMM-page-indicator',
      position: 'top_right',
      config: {
        pages: 4,
        activeBright: true,
        showPageNumberOnHover: false
      }
    },
		{
			module: "alert",
		},
		{
			module: "updatenotification",
			position: "top_bar",
			config: {
				// Core repo check fails on our fork (local 'main' vs upstream 'master' -> no origin/main)
				// MMM-ScreenSleep's own git remote is a private repo; pm2 has no
				// credentials, so `git fetch --dry-run` prompts and fails.
				ignoreModules: ["MagicMirror", "MMM-ScreenSleep"],
				// Broadcast the UPDATES notification that MMM-updates-icon listens for
				sendUpdatesNotifications: true
			}
		},
		{
			module: 'MMM-updates-icon',
			position: 'top_right',
			config: {
				animationSpeed: 0
			}
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
				broadcastPastEvents: true, // include earlier-today events so the calendar view can fade them
        calendars: [

          // Sarah
          {
            name: "Sarah Work",
            url: "${CAL_SARAH_WORK_CALENDAR}",
            color: "#CE8A6A"
          },

          // Family
          {
            name: "Family",
            url: "${CAL_FAMILY_CALENDAR}",
            color: "#9B8B78"
          },

          // Daniel
          {
            name: "Daniel",
            url: "${CAL_DANIEL_CALENDAR}",
            color: "#E67C73"
          },
          {
            name: "Kapow",
            url: "${CAL_KAPOW_CALENDAR}",
            color: "#E67C73"
          },
          {
            name: "Rough Riders",
            url: "${CAL_ROUGH_RIDERS_CALENDAR}",
            color: "#E67C73"
          },
          
          // Luke
          {
            name: "Luke",
            url: "${CAL_LUKE_CALENDAR}",
            color: "#9BB8CC"
          },
          {
            name: "Mustangs",
            url: "${CAL_MUSTANGS_CALENDAR}",
            color: "#9BB8CC"
          },
          
          // Ben
          {
            name: "Ben",
            url: "${CAL_BEN_CALENDAR}",
            color: "#6FA8A0"
          },
          {
            name: "Green Ninjas",
            url: "${CAL_GREEN_NINJAS_CALENDAR}",
            color: "#6FA8A0"
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
        dateHeaderOptions: { month: 'short', day: 'numeric', weekday: 'long' },
        //maxLaneThreshold: 4,
        hourLength: 15,
        beginHour: 6,
        staticTime: true,
        staticWeek: false,
        dayIndex: 0,
        days: 5,
        calendarSet: [], // Leave empty to pull from all default calendars
        // NOTE: this module has no fontSize/eventHeight options — it sizes its
        // type from its own em chain. Calendar typography is controlled in
        // config/calendar-common.css via the --cal-* tokens in custom.css.
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
        maxEventLines: 6,
        showCW: false,
        weekdayOptions: { weekday: 'short' }, // not working
        calendarMergePaths: [], // Leave empty to pull from all default calendars
        // Module-level scale. Keep fontSize in step with --cal-font-size and
        // eventHeight sized to fit --cal-title-size; config/calendar-common.css
        // pins the rendered type to the shared --cal-* tokens.
        fontSize: "28px",
        eventHeight: "34px",
        refreshInterval: 5 * 60 * 1000 // Refreshes every 5 minute
      }
    },
    {
      module: "MMM-AnyLists",
      position: "fullscreen_below",
      config: {
        email: "${ANYLIST_EMAIL}",
        password: "${ANYLIST_PASSWORD}",
        lists: ["Daniel", "Luke", "Ben"], // exact AnyList list names, one column each
        refreshOnExternalChange: true, // websocket-driven reload
        maxItemsPerList: 0, // 0 = unlimited
        textAlign: "left",
        showQuantities: false,
        columnSeparator: true,
        header: "To Do", // panel title; '' removes the header bar
        showCheckedToggle: true, // show/hide-checked button on the header's right
        hideCheckedItems: true // initial state; the tap is remembered after that
      }
    },
    {
      module: "MMM-MLBPlayoffs",
      position: "fullscreen_below",
      config: {
        animationSpeed: 0,
        season: 2026,
        updateInterval: 60 * 60 * 1000, // refresh hourly
        liveInterval: 15 * 60 * 1000 // every 15 min while a game is in progress
      }
    },
    {
      // Blank the display when nobody has touched the mirror. Must stay 'fixed'
      // in MMM-pages above, or page changes would stop the idle timer.
      module: "MMM-ScreenSleep",
      position: "fullscreen_above",
      config: {
        dayIdleTimeout: 2 * 60 * 60 * 1000, // 2 hours of no touch
        nightIdleTimeout: 5 * 60 * 1000, // 5 minutes overnight
        nightStart: "22:00", // quiet window opens
        nightEnd: "06:00", // quiet window closes
        wakeAt: "06:45", // always back on by the time the day starts
        wakeOnTouch: true, // any tap wakes it, at any hour
        // labwc is the display server. DISPLAY=:0 is Xwayland -rootless, which
        // has no hardware access, so xset/DPMS can never blank this panel.
        wlrOutput: "HDMI-A-1", // name as `wlr-randr` reports it
        waylandDisplay: "wayland-0"
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
