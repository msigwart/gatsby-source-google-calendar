# Changelog
## 1.1.4
* Fix: Remove existing calendar and event nodes before creating new ones to prevent stale data

## 1.1.3
* Add schema definitions

## 1.1.2
* Update dependencies
* Improve documentation

## 1.1.1
* Instantiate `dateTime` field of 'all-day' event relative to local timezone

## 1.1.0
* Add `allDay` flag to event data indicating whether or not an event is 'all-day' ([#3](https://github.com/msigwart/gatsby-source-google-calendar/issues/2))
* If an event is 'all-day', populate the event's `dateTime` field with the event's 
`date` taking the calendar's `timeZone` into account

## 1.0.1
* Moved package from @msigwart/gatsby-source-google-calendar to gatsby-source-google-calendar (used version 1.0.1 instead of 1.0.0 to avoid conflicting with previously published package)

## 0.2.1
* Fix error that was caused when an event does not have a description ([#1](https://github.com/msigwart/gatsby-source-google-calendar/issues/1))

## 0.2.0
* Add support for multiple calendars 

## 0.1.0
* First version of the plugin with the ability to source events from a single Google Calendar
