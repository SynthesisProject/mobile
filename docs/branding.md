# Branding

## Custom icons
Icons are automatically included to the application during the cordova build process
These icons / splash screens are placed in `src/res` for each platform

You may replace these icons with your own.

### Icon generator script
You can generate your own icons by using the script within `src/res/icons.sh`
This script uses svg files as an input, and generates all icons and splash screens using linux command line tools (see source code of the script for more info).
After the script is completed, all icons will be replaced within `src/res` and you can rebuild the application which will now include your new icons.

*NOTE* The script does not guarantee that the icons will be perfect. Please make sure about each of the files that are generated. The script is only provided as a shortcut to quickly create icons in the required sizes, normally you would have a marketing department source you icons in the required sizes.
