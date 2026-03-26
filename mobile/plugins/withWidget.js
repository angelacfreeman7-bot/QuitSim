/**
 * Expo Config Plugin — adds the QuitSimWidget extension target to the Xcode project.
 *
 * This plugin:
 * 1. Adds App Groups entitlement to the main app
 * 2. Creates a new native target for the WidgetKit extension
 * 3. Configures build settings, Info.plist, and entitlements
 */
const {
  withXcodeProject,
  withEntitlementsPlist,
} = require('@expo/config-plugins');
const path = require('path');

const WIDGET_NAME = 'QuitSimWidget';
const APP_GROUP = 'group.app.quitsim.mobile';
const WIDGET_BUNDLE_ID = 'app.quitsim.mobile.widget';

// Step 1: Ensure App Groups entitlement on the main app
function withAppGroupEntitlement(config) {
  return withEntitlementsPlist(config, (mod) => {
    mod.modResults['com.apple.security.application-groups'] = [APP_GROUP];
    return mod;
  });
}

// Step 2: Add the widget extension target to the Xcode project
function withWidgetTarget(config) {
  return withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const targetName = WIDGET_NAME;

    // Check if widget target already exists
    const existingTarget = project.pbxTargetByName(targetName);
    if (existingTarget) {
      return mod;
    }

    // Add the widget extension target
    const widgetTarget = project.addTarget(
      targetName,
      'app_extension',
      `${WIDGET_NAME}.appex`,
      WIDGET_BUNDLE_ID
    );

    // Add the widget source files to the project
    const widgetGroupKey = project.pbxCreateGroup(targetName, targetName);

    // Add to the main project group
    const mainGroupKey = project.getFirstProject().firstProject.mainGroup;
    project.addToPbxGroup(widgetGroupKey, mainGroupKey);

    // Add source files
    const widgetDir = path.join('..', WIDGET_NAME);
    project.addSourceFile(
      `${widgetDir}/QuitSimWidget.swift`,
      { target: widgetTarget.uuid },
      widgetGroupKey
    );

    // Configure build settings for the widget target
    const configurations = project.pbxXCBuildConfigurationSection();
    Object.keys(configurations).forEach((key) => {
      const config = configurations[key];
      if (config.buildSettings && config.name) {
        // Find configs belonging to our widget target
        const targetConfigs = project.pbxXCConfigurationList()
          ? project.pbxXCConfigurationList()[widgetTarget.buildConfigurationList]
          : null;

        if (targetConfigs && targetConfigs.buildConfigurations) {
          const isWidgetConfig = targetConfigs.buildConfigurations.some(
            (bc) => bc.value === key
          );
          if (isWidgetConfig) {
            config.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = WIDGET_BUNDLE_ID;
            config.buildSettings.SWIFT_VERSION = '5.0';
            config.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '15.1';
            config.buildSettings.TARGETED_DEVICE_FAMILY = '1';
            config.buildSettings.MARKETING_VERSION = '1.0';
            config.buildSettings.CURRENT_PROJECT_VERSION = '1';
            config.buildSettings.CODE_SIGN_ENTITLEMENTS = `${WIDGET_NAME}/${WIDGET_NAME}.entitlements`;
            config.buildSettings.INFOPLIST_FILE = `${WIDGET_NAME}/Info.plist`;
            config.buildSettings.LD_RUNPATH_SEARCH_PATHS = '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"';
            config.buildSettings.SKIP_INSTALL = 'YES';
            config.buildSettings.GENERATE_INFOPLIST_FILE = 'NO';
            config.buildSettings.ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME = 'WidgetBackground';
          }
        }
      }
    });

    // Add the widget as an embed target (copy into app bundle)
    project.addBuildPhase(
      [`${WIDGET_NAME}.appex`],
      'PBXCopyFilesBuildPhase',
      'Embed App Extensions',
      project.getFirstTarget().uuid,
      'app_extension'
    );

    return mod;
  });
}

module.exports = function withQuitSimWidget(config) {
  config = withAppGroupEntitlement(config);
  config = withWidgetTarget(config);
  return config;
};
