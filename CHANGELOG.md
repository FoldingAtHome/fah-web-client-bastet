Folding@home Web Control Changelog
=================================

## v8.5.1
 - Confirm WU dump.

## v8.5.0
 - Add support for HIP
 - Added team timeseries charts

## v8.4.9
 - Show ``Warning`` when more than one consecutive WU fails.
 - Validate login and registration fields and show errors on failures.
 - Show appropriate message on attempt to register existing account.

## v8.4.7
 - Show "Failed" message on group paused due to too many failed WUs.
 - Highlight group or machine with error (red) or warn (orange) on failures.

## v8.4.6
 - Handle missing teams array.
 - Unit progress fixes.

## v8.4.5
 - Fix Windows OS icon. #194
 - Clear WU fail/retry status after successfully running for 2 mins.  #196
 - Confirm click on team website link.
 - Set default team logo in team editor dialog.
 - Automatically add ``https://`` to team URLs.
 - Added edit icon to team stats for team owner.
 - Retain WU tab state.  #198

## v8.4.4
 - Include finishing WUs in total PPD.
 - Removed ``Work Unit Averages`` replaced with ``Work Unit Stats``.
 - Added WU filtering and stats on ``Work Units`` page.
 - Show OS icon on ``Work Units`` page.
 - Show state specific wait status text.

## v8.4.3
 - Hide scrollbar in full screen mode.
 - Moved global fold/pause buttons out of header.
 - Show machine, CPU, GPU and PPD totals on machines page.
 - Team logo and homepage link in header.
 - Account settings split in to multiple tabs.
 - Team creation and editing via account settings.
 - User avatar.
 - Prevent saving invalid account or machine settings.

## v8.4.2
 - Fixed client version checking.
 - Fixed GPUs display with zero GPUs.
 - Fixed Work Unit Details timeout / deadline text.  #161
 - Use monospaced font for info items.  #110
 - Show logged credits in WU view.
 - Fixed RCG display before WU download.  #165
 - Change direct client address hotkey to CTRL+SHIFT+L.  #166
 - Added direct address dialog input validation.
 - Prevent negative ETA.  #167
 - Added help on Work Units page. #169
 - Show WU Average resources.  #169
 - Removed WU Average total run time.  #169
 - Removed double scroll bar on WU page.  #169
 - Sortable Work Unit Averages.
 - Show machine name instead of WU number in WU history.  #160

## v8.4.1
 - Fix ``Finishing`` display bug.
 - Updated auto-link dialog wording.
 - Fix ``Base Credit`` display.
 - Fix GPU description display.
 - Fix scrollbar problem with wide mode on Chrome.

## v8.4.0
 - Configurable WU columns. #128
 - Moved dark/light theme selection to account settings.
 - Show WU TPF.  #43
 - Support wide display.
 - Support compact mode.
 - Moved machine unlink and name editing to machine settings.
 - Show "target" icon next to directly connected client.
 - CTRL-C to change direct client address.
 - Improved log view performance for very large log files.
 - WU history. #133
 - Added WU TPF benchmarking information. #153
 - Show ``Unlinked`` if machine is not linked to the logged in account.
 - Show info dialog when auto-linking occurs.
 - Confirm machine unlinking.
 - Added disable CUDA option.
 - CTRL-C opens direct client connection dialog.
 - Added per WU log button.  #125

## v8.3.18
 - Added notice about Brave browser.

## v8.3.17
 - Fixes for account (un)linking and node changes.
 - Use broadcast messages to detect account config changes.
 - Fixed stats user lookup with special name characters.
 - Use passkey in stats lookup. #156

## v8.3.13
 - Fix local machine log/viz enable on page reload.
 - Scroll log to end on LogView page load.

## v8.3.5
 - Fix Stats display with long user name. #138
 - Show project number with RCG in WU details view. #131
 - More robust handling of missing user/team stats data.

## v8.3.4
 - Beta release

## v8.3.2
 - Replaced resource group selection box in settings with left-hand column. #123
 - Compare Web Control versions and reload/redirect page if out of date.
 - Show errors for API network failures.
 - Detect v8.1.x clients
 - Link WU project to WU details view rather than stats site
 - Display more machine/wu info

## v8.3.0
 - Proper support for mobile devices.
 - Return of resource groups.
 - User and team stats.

## v8.2.2
 - Fixed bug when saving settings to local client when not logged in to account.

## v8.2.1
 - Added spinning wheel pacifier when waiting for actions.
 - Improved caching of downloaded resources.  Including 3D view frames.
 - Get user/team/passkey from local client on account registration.
 - Bug fixes for Edge/Chrome/Safari.
 - New Folding@home account register/login.
 - Don't show anonymous points.
 - Don't show projects or units for disconnected clients.
 - Dark mode fixes.
 - Shuffle news feed.
 - Some fixes for wrong atom types with OpenMM 0x22 core.
 - Show warning when client is out of date #86.
 - Machine info panel.
 - Moved WU details from 3D viewer to panel on main page.
 - On screen help popups.
 - Delete account feature.
 - Case-insensitive log search.
 - Fixes for latest client version detection.
