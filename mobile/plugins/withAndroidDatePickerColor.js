const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to customize Android date picker accent color
 * This sets the colorAccent to match the app's primary theme color (#50C9C3)
 */
const withAndroidDatePickerColor = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const stylesPath = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/res/values/styles.xml'
      );

      // Ensure the directory exists
      const stylesDir = path.dirname(stylesPath);
      if (!fs.existsSync(stylesDir)) {
        fs.mkdirSync(stylesDir, { recursive: true });
      }

      let stylesContent = '';
      if (fs.existsSync(stylesPath)) {
        stylesContent = fs.readFileSync(stylesPath, 'utf8');
      } else {
        // Create a basic styles.xml if it doesn't exist
        stylesContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
</resources>`;
      }

      // Add or update colorAccent
      if (!stylesContent.includes('name="colorAccent"')) {
        stylesContent = stylesContent.replace(
          '</resources>',
          `    <color name="colorAccent">#50C9C3</color>
</resources>`
        );
      } else {
        // Update existing colorAccent
        stylesContent = stylesContent.replace(
          /<color name="colorAccent">[^<]*<\/color>/,
          '<color name="colorAccent">#50C9C3</color>'
        );
      }

      // Add DatePickerDialog theme if it doesn't exist
      if (!stylesContent.includes('AppTheme.DatePickerDialog')) {
        const datePickerTheme = `    <style name="AppTheme.DatePickerDialog" parent="Theme.AppCompat.Light.Dialog">
        <item name="colorAccent">#50C9C3</item>
    </style>
`;
        
        stylesContent = stylesContent.replace(
          '</resources>',
          datePickerTheme + '</resources>'
        );
      }

      fs.writeFileSync(stylesPath, stylesContent, 'utf8');
      return config;
    },
  ]);
};

module.exports = withAndroidDatePickerColor;
