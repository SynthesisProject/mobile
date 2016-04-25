Cordova Plugins
--
Cordova plugins are used to give the web front-end access to native features of the application, as well as to configure application settings.
Here we list the plugins used and what functionality they bring to the application.

cordova-plugin-device
---
Allows the application to get the device id and module which is used to register the device with the Synthesis Service.
This is also required to register the device for push notifications.

cordova-plugin-dialogs
---
This plugins allows as to create native dialogs. Mainly used to the exit application confirmation dialog.

cordova-plugin-disable-nsapptransportsecurity
---
Used only for iOS to disable the security check that doesn't allow the application to connect to a non-ssl service.
If you instance of Synthesis Service is running on SSL you may remove this plugin.

cordova-plugin-file
---
Allows the application to write to the filesystem. Used to store application settings, as well as content downloaded from the Synthesis Service.

cordova-plugin-file-transfer
---
Used to download files from the Synthesis Service and persist to device file system.


cordova-plugin-inappbrowser
---
Used to open downloaded content on the device's external web browser, or let the device prompt for an application to use.

cordova-plugin-statusbar
---
Used for iOS to control the status bar to prevent it from appearing on top of the application window.

cordova-plugin-whitelist
---
Used to whitelist online services to which the application may connect.

coza.opencollab.cordova.plugins.fileopener
---
A plugin used to open files on the native device. This plugin will let the phone use the default application of prompt for an application to use when attempting to open a downloaded file.

phonegap-plugin-push
---
Plugin used to register and listen for push notification from the Synthesis Service.
