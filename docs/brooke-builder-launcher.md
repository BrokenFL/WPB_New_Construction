# Brooke Builder Launcher

Brooke Builder is a local-only editor for WPB New Construction.

Local URL:

```sh
http://127.0.0.1:8787
```

Install the Desktop launcher:

```sh
/Volumes/ExternalSSD/WPB_NewConstruction/tools/launchers/install-brooke-builder-launcher.command
```

Open Brooke Builder after install by double-clicking:

```sh
~/Desktop/Open Brooke Builder.command
```

The installer verifies the ExternalSSD workspace, Node.js, and npm. It makes the launcher executable, copies it to the Desktop, and opens the local Builder URL.

Automation installers are intentionally separate. Run these only when you want the LaunchAgents installed and loaded:

```sh
/Volumes/ExternalSSD/WPB_NewConstruction/tools/launchers/install-daily-maintenance.command
/Volumes/ExternalSSD/WPB_NewConstruction/tools/launchers/install-news-publisher-automation.command
```

Installed schedules:

- Daily maintenance: `npm run daily:maintenance` at 9:00 AM local time.
- News publisher: `npm run news:daily-publisher` at 9:20 AM local time.

Uninstall automation:

```sh
/Volumes/ExternalSSD/WPB_NewConstruction/tools/launchers/uninstall-daily-maintenance.command
/Volumes/ExternalSSD/WPB_NewConstruction/tools/launchers/uninstall-news-publisher-automation.command
```

Troubleshooting:

- If the Builder page does not load, double-click the Desktop launcher and keep its Terminal window open.
- If the workspace is missing, mount `/Volumes/ExternalSSD`.
- If Node.js or npm is missing, install Node.js or open the launcher from a shell where both commands are available.
- Builder files are not deployed to the public website.
