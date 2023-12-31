#!/usr/bin/env node

var fs = require("fs");

var path = require("path");

module.exports = function (context) {
  const log = "\t[ Notification Service Extension] ";

  var rootdir = context.opts.projectRoot;

  var project = path.join(rootdir, "platforms/ios");

  console.log(log + "Installation start");

  var configXml = fs.readFileSync(path.join(rootdir, "config.xml"), "utf8");

  var appName = configXml.match(/<name>(.+?)<\/name>/);

  if (!!!appName) {
    console.error(log + "Can't get App Name from ./config.xml");

    process.exit(1);
  }

  appName = appName[1];

  var info = fs.readFileSync(
    path.join(project, appName, appName + "-Info.plist"),
    "utf8"
  );

  var config = [];

  for (var key of [
    "CFBundleShortVersionString",
    "CFBundleVersion",
    "CFBundleName",
  ]) {
    var matchs = info.match(
      new RegExp("<key>" + key + "</key>(?:(?:.|\n)+?)<string>(.+?)</string>")
    );

    if (!!!matchs) {
      console.error(
        log + "Can't get " + key + " from ./" + appName + "-Info.plist"
      );

      process.exit(1);
    }

    config[key] = matchs[1];
  }

  var projectid = config["CFBundleName"];

  var appVersion = config["CFBundleShortVersionString"];

  var appBuild = config["CFBundleVersion"];

  var appTarget = "11.0";

  var cnt = fs.readFileSync(
    path.join(project, appName + ".xcodeproj/project.pbxproj"),
    "utf8"
  );

  if (cnt.indexOf("NotificationService.m") > -1) {
    console.log(log + "Source files and Frameworks already installed. [Skip]");
  } else {
    // Get Project Object ID

    var projId = cnt.match(/rootObject = (.+?)(?:| \/\* Project object \*\/);/);

    if (!!!projId) {
      console.error(log + "Can't get Project object from project.pbxproj");

      process.exit(1);
    }

    projId = projId[1];

    // Append PBXBuildFile section

    console.log(log + "Append PBXBuildFile section");

    cnt = cnt.replace(
      "/* End PBXBuildFile section */",

      "\t\tFFFFFFFFFFFFFFFFFFFF5C15 /* NotificationService.m in Sources */ = {isa = PBXBuildFile; fileRef = FFFFFFFFFFFFFFFFFFFF6A7C /* NotificationService.m */; };\n" +
        "\t\tFFFFFFFFFFFFFFFFFFFF9238 /* NotificationServiceExtension.appex in Embed App Extensions */ = {isa = PBXBuildFile; fileRef = FFFFFFFFFFFFFFFFFFFF0CC6 /* NotificationServiceExtension.appex */; settings = {ATTRIBUTES = (RemoveHeadersOnCopy, ); }; };\n" +
        "\t\tFFFFFFFFFFFFFFFFFFFF9AC8 /* CoreGraphics.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = FFFFFFFFFFFFFFFFFFFF8FC2 /* CoreGraphics.framework */; };\n" +
        "\t\tFFFFFFFFFFFFFFFFFFFFA186 /* WebKit.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = FFFFFFFFFFFFFFFFFFFF16D6 /* WebKit.framework */; };\n" +
        "\t\tFFFFFFFFFFFFFFFFFFFFAED6 /* UIKit.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = FFFFFFFFFFFFFFFFFFFFA60A /* UIKit.framework */; };\n" +
        "\t\tFFFFFFFFFFFFFFFFFFFFA397 /* SystemConfiguration.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = FFFFFFFFFFFFFFFFFFFF15DB /* SystemConfiguration.framework */; };\n" +
        "\t\tFFFFFFFFFFFFFFFFFFFF5C17 /* UserNotifications.framework in Frameworks */ = {isa = PBXBuildFile; fileRef = FFFFFFFFFFFFFFFFFFFF2F84 /* PushKit.framework */; };\n" +
        "/* End PBXBuildFile section */"
    );

    // Append PBXContainerItemProxy section

    console.log(log + "Append PBXContainerItemProxy section");

    cnt = cnt.replace(
      "/* End PBXContainerItemProxy section */",

      "\t\tFFFFFFFFFFFFFFFFFFFF0E7E /* PBXContainerItemProxy */ = {\n" +
        "\t\t\tisa = PBXContainerItemProxy;\n" +
        "\t\t\tcontainerPortal = " +
        projId +
        " /* Project object */;\n" +
        "\t\t\tproxyType = 1;\n" +
        "\t\t\tremoteGlobalIDString = FFFFFFFFFFFFFFFFFFFF5D00;\n" +
        "\t\t\tremoteInfo = NotificationServiceExtension;\n" +
        "\t\t};\n" +
        "/* End PBXContainerItemProxy section */"
    );

    // Add or append PBXCopyFilesBuildPhase section

    console.log(log + "Append PBXCopyFilesBuildPhase section");

    if (cnt.indexOf("/* End PBXCopyFilesBuildPhase section */") === -1) {
      cnt = cnt.replace(
        "/* End PBXContainerItemProxy section */",
        "/* End PBXContainerItemProxy section */\n\n/* Begin PBXCopyFilesBuildPhase section */\n/* End PBXCopyFilesBuildPhase section */"
      );
    }

    cnt = cnt.replace(
      "/* End PBXCopyFilesBuildPhase section */",
      "\t\tFFFFFFFFFFFFFFFFFFFF2C80 /* Embed App Extensions */ = {\n" +
        "\t\t\tisa = PBXCopyFilesBuildPhase;\n" +
        "\t\t\tbuildActionMask = 2147483647;\n" +
        '\t\t\tdstPath = "";\n' +
        "\t\t\tdstSubfolderSpec = 13;\n" +
        "\t\t\tfiles = (\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF9238 /* NotificationServiceExtension.appex in Embed App Extensions */,\n" +
        "\t\t\t);\n" +
        '\t\t\tname = "Embed App Extensions";\n' +
        "\t\t\trunOnlyForDeploymentPostprocessing = 0;\n" +
        "\t\t};\n" +
        "/* End PBXCopyFilesBuildPhase section */"
    );

    // Append PBXFileReference section

    console.log(log + "Append PBXFileReference section");

    cnt = cnt.replace(
      "/* End PBXFileReference section */",

      '\t\tFFFFFFFFFFFFFFFFFFFF0CC6 /* NotificationServiceExtension.appex */ = {isa = PBXFileReference; explicitFileType = "wrapper.app-extension"; includeInIndex = 0; path = NotificationServiceExtension.appex; sourceTree = BUILT_PRODUCTS_DIR; };\n' +
        '\t\tFFFFFFFFFFFFFFFFFFFFCDA5 /* NotificationService.h */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.c.h; path = NotificationService.h; sourceTree = "<group>"; };\n' +
        '\t\tFFFFFFFFFFFFFFFFFFFF6A7C /* NotificationService.m */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.c.objc; path = NotificationService.m; sourceTree = "<group>"; };\n' +
        '\t\tFFFFFFFFFFFFFFFFFFFFCB44 /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };\n' +
        "\t\tFFFFFFFFFFFFFFFFFFFF8FC2 /* CoreGraphics.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = CoreGraphics.framework; path = System/Library/Frameworks/CoreGraphics.framework; sourceTree = SDKROOT; };\n" +
        '\t\tFFFFFFFFFFFFFFFFFFFF2F84 /* UserNotifications.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = UserNotifications.framework; path = System/Library/Frameworks/UserNotifications.framework; sourceTree = "<group>"; };\n' +
        "\t\tFFFFFFFFFFFFFFFFFFFF16D6 /* WebKit.framework */ = {isa = PBXFileReference; explicitFileType = undefined; fileEncoding = 9; includeInIndex = 0; lastKnownFileType = wrapper.framework; name = WebKit.framework; path = System/Library/Frameworks/WebKit.framework; sourceTree = SDKROOT; };\n" +
        "\t\tFFFFFFFFFFFFFFFFFFFFA60A /* UIKit.framework */ = {isa = PBXFileReference; explicitFileType = undefined; fileEncoding = undefined; includeInIndex = 0; lastKnownFileType = wrapper.framework; name = UIKit.framework; path = System/Library/Frameworks/UIKit.framework; sourceTree = SDKROOT; };\n" +
        "\t\tFFFFFFFFFFFFFFFFFFFF15DB /* SystemConfiguration.framework */ = {isa = PBXFileReference; explicitFileType = undefined; fileEncoding = undefined; includeInIndex = 0; lastKnownFileType = wrapper.framework; name = SystemConfiguration.framework; path = System/Library/Frameworks/SystemConfiguration.framework; sourceTree = SDKROOT; };\n" +
        "/* End PBXFileReference section */"
    );

    // Append PBXFrameworksBuildPhase section

    console.log(log + "Append PBXFrameworksBuildPhase section");

    cnt = cnt.replace(
      "/* End PBXFrameworksBuildPhase section */",

      "\t\tFFFFFFFFFFFFFFFFFFFFFAB3 /* Frameworks */ = {\n" +
        "\t\t\tisa = PBXFrameworksBuildPhase;\n" +
        "\t\t\tbuildActionMask = 2147483647;\n" +
        "\t\t\tfiles = (\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF5C17 /* UserNotifications.framework in Frameworks */,\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFFA397 /* SystemConfiguration.framework in Frameworks */,\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFFAED6 /* UIKit.framework in Frameworks */,\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFFA186 /* WebKit.framework in Frameworks */,\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF9AC8 /* CoreGraphics.framework in Frameworks */,\n" +
        "\t\t\t);\n" +
        "\t\t\trunOnlyForDeploymentPostprocessing = 0;\n" +
        "\t\t};\n" +
        "/* End PBXFrameworksBuildPhase section */"
    );

    // Append PBXGroup section > Products > children

    console.log(log + "Append PBXGroup section > Products > children");

    var id = cnt.match(/productRefGroup = (.+?) \/\* Products \*\/;/); // Search for ID

    if (!!!id) {
      console.error(log + "Can't get Products ID from project.pbxproj");

      process.exit(1);
    }

    id = id[1]; // Get matched value

    var matchs = cnt.match(
      new RegExp(
        "\\t\\t" +
          id +
          " /\\* Products \\*/ = {(?:(?:.|\n)+?)children = \\(\n((.|\n)+?)\\t\\t\\t\\);(?:(?:.|\n)+?)};"
      )
    ); // Search section

    if (!!!matchs) {
      console.error(log + "Can't get Products content from project.pbxproj");

      process.exit(1);
    }

    var section = matchs[0]; // Store old section

    var appended = section.replace(
      matchs[1],
      matchs[1] +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF0CC6 /* NotificationServiceExtension.appex */,\n"
    ); // Store new section

    cnt = cnt.replace(section, appended); // Replaces it

    // Append PBXGroup section > CustomTemplate > children

    console.log(log + "Append PBXGroup section > CustomTemplate > children");

    var id = cnt.match(/mainGroup = (.+?)(?:| \/\* CustomTemplate \*\/);/); // Search for ID

    if (!!!id) {
      console.error(log + "Can't get CustomTemplate ID from project.pbxproj");

      process.exit(1);
    }

    id = id[1]; // Get matched value

    var matchs = cnt.match(
      new RegExp(
        "\\t\\t" +
          id +
          "(?:| /\\* CustomTemplate \\*/) = {(?:(?:.|\n)+?)children = \\(\n((.|\n)+?)\\t\\t\\t\\);(?:(?:.|\n)+?)};"
      )
    ); // Search section

    if (!!!matchs) {
      console.error(
        log + "Can't get CustomTemplate content from project.pbxproj"
      );

      process.exit(1);
    }

    var section = matchs[0]; // Store old section

    var appended = section.replace(
      matchs[1],
      matchs[1] +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF1F29 /* NotificationServiceExtension */,\n"
    ); // Store new section

    cnt = cnt.replace(section, appended); // Replaces it

    // Append PBXGroup section > Frameworks > children

    console.log(log + "Append PBXGroup section > Frameworks > children");

    var id = appended.match(/\t\t\t\t(.+?) \/\* Frameworks \*\/,/);

    if (!!!id) {
      console.error(log + "Can't get Frameworks ID from project.pbxproj");

      process.exit(1);
    }

    id = id[1];

    var matchs = cnt.match(
      new RegExp(
        "\\t\\t" +
          id +
          " /\\* Frameworks \\*/ = {(?:(?:.|\n)+?)children = \\(\n((.|\n)+?)\\t\\t\\t\\);(?:(?:.|\n)+?)};"
      )
    ); // Search section

    if (!!!matchs) {
      console.error(log + "Can't get Frameworks content from project.pbxproj");

      process.exit(1);
    }

    var section = matchs[0]; // Store old section

    var appended = section.replace(
      matchs[1],
      matchs[1] +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF2F84 /* UserNotifications.framework */,\n\t\t\t\tFFFFFFFFFFFFFFFFFFFF8FC2 /* CoreGraphics.framework */,\n" + // Store new section
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF16D6 /* WebKit.framework */,\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFFA60A /* UIKit.framework */,\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF15DB /* SystemConfiguration.framework */,\n"
    );

    cnt = cnt.replace(section, appended); // Replaces it

    // Append PBXGroup section

    console.log(log + "Append PBXGroup section");

    cnt = cnt.replace(
      "/* End PBXGroup section */",

      "\t\tFFFFFFFFFFFFFFFFFFFF1F29 /* NotificationServiceExtension */ = {\n" +
        "\t\t\tisa = PBXGroup;\n" +
        "\t\t\tchildren = (\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFFCDA5 /* NotificationService.h */,\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF6A7C /* NotificationService.m */,\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFFCB44 /* Info.plist */,\n" +
        "\t\t\t);\n" +
        "\t\t\tpath = NotificationServiceExtension;\n" +
        '\t\t\tsourceTree = "<group>";\n' +
        "\t\t};\n" +
        "/* End PBXGroup section */"
    );

    // Append PBXNativeTarget section > AppName > buildPhases & dependencies

    console.log(
      log +
        "Append PBXNativeTarget section > AppName > buildPhases & dependencies"
    );

    var matchs = cnt.match(
      new RegExp(
        "/\\* Begin PBXNativeTarget section \\*/(?:(?:.|\n)+?)buildPhases = \\(\n((.|\n)+?)\\t\\t\\t\\);(?:(?:.|\n)+?)dependencies = \\(\n((.|\n)+?)\\t\\t\\t\\);((.|\n)+?)/\\* End PBXNativeTarget section \\*/"
      )
    ); // Search section

    if (!!!matchs) {
      console.error(log + "Can't get target content from project.pbxproj");

      process.exit(1);
    }

    var section = matchs[0]; // Store old section

    var appended = section.replace(
      matchs[1],
      matchs[1] +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF2C80 /* Embed App Extensions */,\n"
    ); // Store new section

    appended = appended.replace(
      matchs[3],
      matchs[3] +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF9CCD /* PBXTargetDependency */,\n"
    ); // Store new section

    cnt = cnt.replace(section, appended); // Replaces it

    // Append PBXNativeTarget section

    console.log(log + "Append PBXNativeTarget section");

    cnt = cnt.replace(
      "/* End PBXNativeTarget section */",

      "\t\tFFFFFFFFFFFFFFFFFFFF5D00 /* NotificationServiceExtension */ = {\n" +
        "\t\t\tisa = PBXNativeTarget;\n" +
        '\t\t\tbuildConfigurationList = FFFFFFFFFFFFFFFFFFFFB33D /* Build configuration list for PBXNativeTarget "NotificationServiceExtension" */;\n' +
        "\t\t\tbuildPhases = (\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF7943 /* Sources */,\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFFFAB3 /* Frameworks */,\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFFBAB7 /* Resources */,\n" +
        "\t\t\t);\n" +
        "\t\t\tbuildRules = (\n" +
        "\t\t\t);\n" +
        "\t\t\tdependencies = (\n" +
        "\t\t\t);\n" +
        "\t\t\tname = NotificationServiceExtension;\n" +
        "\t\t\tproductName = NotificationServiceExtension;\n" +
        "\t\t\tproductReference = FFFFFFFFFFFFFFFFFFFF0CC6 /* NotificationServiceExtension.appex */;\n" +
        '\t\t\tproductType = "com.apple.product-type.app-extension";\n' +
        "\t\t};\n" +
        "/* End PBXNativeTarget section */"
    );

    // Append PBXProject section > AppName > attributes & targets

    console.log(
      log + "Append PBXProject section > AppName > attributes & targets"
    );

    var matchs = cnt.match(
      new RegExp(
        "/\\* Begin PBXProject section \\*/(?:(?:.|\n)+?)attributes = \\{\n((.|\n)+?)\\t\\t\\t\\};(?:(?:.?|\n)+?)targets = \\(\n((.|\n)+?)\\t\\t\\t\\);((.|\n)+?)/\\* End PBXProject section \\*/"
      )
    ); // Search section

    if (!!!matchs) {
      console.error(log + "Can't get PBXProject content from project.pbxproj");

      process.exit(1);
    }

    var section = matchs[0]; // Store old section

    var appended = section.replace(
      matchs[1],
      matchs[1] +
        "\t\t\t\tTargetAttributes = {\n\t\t\t\t\tFFFFFFFFFFFFFFFFFFFF5D00 = {\n\t\t\t\t\t\tCreatedOnToolsVersion = 12.4;\n\t\t\t\t\t};\n\t\t\t\t};\n"
    ); // Store new section

    appended = appended.replace(
      matchs[3],
      matchs[3] +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF5D00 /* NotificationServiceExtension */,\n"
    ); // Store new section

    cnt = cnt.replace(section, appended); // Replaces it

    // Append PBXNativeTarget section

    console.log(log + "Append PBXNativeTarget section");

    cnt = cnt.replace(
      "/* End PBXResourcesBuildPhase section */",

      "\t\tFFFFFFFFFFFFFFFFFFFFBAB7 /* Resources */ = {\n" +
        "\t\t\tisa = PBXResourcesBuildPhase;\n" +
        "\t\t\tbuildActionMask = 2147483647;\n" +
        "\t\t\tfiles = (\n" +
        "\t\t\t);\n" +
        "\t\t\trunOnlyForDeploymentPostprocessing = 0;\n" +
        "\t\t};\n" +
        "/* End PBXResourcesBuildPhase section */"
    );

    // Append PBXSourcesBuildPhase section

    console.log(log + "Append PBXSourcesBuildPhase section");

    cnt = cnt.replace(
      "/* End PBXSourcesBuildPhase section */",

      "\t\tFFFFFFFFFFFFFFFFFFFF7943 /* Sources */ = {\n" +
        "\t\t\tisa = PBXSourcesBuildPhase;\n" +
        "\t\t\tbuildActionMask = 2147483647;\n" +
        "\t\t\tfiles = (\n" +
        "\t\t\t\tFFFFFFFFFFFFFFFFFFFF5C15 /* NotificationService.m in Sources */,\n" +
        "\t\t\t);\n" +
        "\t\t\trunOnlyForDeploymentPostprocessing = 0;\n" +
        "\t\t};\n" +
        "/* End PBXSourcesBuildPhase section */"
    );

    // Append PBXTargetDependency section

    console.log(log + "Append PBXTargetDependency section");

    cnt = cnt.replace(
      "/* End PBXTargetDependency section */",

      "\t\tFFFFFFFFFFFFFFFFFFFF9CCD /* PBXTargetDependency */ = {\n" +
        "\t\t\tisa = PBXTargetDependency;\n" +
        "\t\t\ttarget = FFFFFFFFFFFFFFFFFFFF5D00 /* NotificationServiceExtension */;\n" +
        "\t\t\ttargetProxy = FFFFFFFFFFFFFFFFFFFF0E7E /* PBXContainerItemProxy */;\n" +
        "\t\t};\n" +
        "/* End PBXTargetDependency section */"
    );

    // Append XCBuildConfiguration section

    console.log(log + "Append XCBuildConfiguration section");

    cnt = cnt.replace(
      "/* End XCBuildConfiguration section */",

      "\t\tFFFFFFFFFFFFFFFFFFFF0074 /* Debug */ = {\n" +
        "\tisa = XCBuildConfiguration;\n" +
        "\tbaseConfigurationReference = F5F70C5359B85256C5598E23 /* Pods-NotificationServiceExtension.debug.xcconfig */;\n" +
        "\tbuildSettings = {\n" +
        "\t\tALWAYS_SEARCH_USER_PATHS = NO;\n" +
        "\t\tASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;\n" +
        "\t\tCLANG_ANALYZER_NONNULL = YES;\n" +
        "\t\tCLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;\n" +
        '\t\tCLANG_CXX_LANGUAGE_STANDARD = "gnu++20";\n' +
        "\t\tCLANG_ENABLE_OBJC_WEAK = YES;\n" +
        "\t\tCLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;\n" +
        "\t\tCLANG_WARN_DOCUMENTATION_COMMENTS = YES;\n" +
        "\t\tCLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;\n" +
        "\t\tCLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;\n" +
        "\t\tCLANG_WARN_UNGUARDED_AVAILABILITY = YES_AGGRESSIVE;\n" +
        "\t\tCODE_SIGN_STYLE = Automatic;\n" +
        "\t\tCOPY_PHASE_STRIP = NO;\n" +
        "\t\tCURRENT_PROJECT_VERSION = 1;\n" +
        "\t\tDEBUG_INFORMATION_FORMAT = dwarf;\n" +
        "\t\tDEVELOPMENT_TEAM = GUEU3B4EX5;\n" +
        "\t\tENABLE_USER_SCRIPT_SANDBOXING = YES;\n" +
        "\t\tGCC_C_LANGUAGE_STANDARD = gnu17;\n" +
        "\t\tGCC_DYNAMIC_NO_PIC = NO;\n" +
        "\t\tGCC_OPTIMIZATION_LEVEL = 0;\n" +
        "\t\tGCC_PREPROCESSOR_DEFINITIONS = (\n" +
        '\t\t\t"DEBUG=1",\n' +
        '\t\t\t"$(inherited)",\n' +
        "\t\t);\n" +
        "\t\tGCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;\n" +
        "\t\tGCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;\n" +
        "\t\tGENERATE_INFOPLIST_FILE = YES;\n" +
        "\t\tINFOPLIST_FILE = NotificationServiceExtension/Info.plist;\n" +
        "\t\tINFOPLIST_KEY_CFBundleDisplayName = NotificationServiceExtension;\n" +
        '\t\tINFOPLIST_KEY_NSHumanReadableCopyright = "";\n' +
        "\t\tIPHONEOS_DEPLOYMENT_TARGET = 11.0;\n" +
        "\t\tLD_RUNPATH_SEARCH_PATHS = (\n" +
        '\t\t\t"$(inherited)",\n' +
        '\t\t\t"@executable_path/Frameworks",\n' +
        '\t\t\t"@executable_path/../../Frameworks",\n' +
        "\t\t);\n" +
        "\t\tLOCALIZATION_PREFERS_STRING_CATALOGS = YES;\n" +
        "\t\tMARKETING_VERSION = 1.0;\n" +
        "\t\tMTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;\n" +
        "\t\tMTL_FAST_MATH = YES;\n" +
        "\t\tPRODUCT_BUNDLE_IDENTIFIER = com.wolkus.fasalapp.NotificationServiceExtension;\n" +
        '\t\tPRODUCT_NAME = "$(TARGET_NAME)";\n' +
        "\t\tSKIP_INSTALL = YES;\n" +
        "\t\tSWIFT_EMIT_LOC_STRINGS = YES;\n" +
        '\t\tTARGETED_DEVICE_FAMILY = "1,2";\n' +
        "\t};\n" +
        "\tname = Debug;\n" +
        "\t\t};\n" +
        "\t\tFFFFFFFFFFFFFFFFFFFFE808 /* Release */ = {\n" +
        "\tisa = XCBuildConfiguration;\n" +
        "\tbaseConfigurationReference = B2F9B1496521B3D913AD4C77 /* Pods-NotificationServiceExtension.release.xcconfig */;\n" +
        "\tbuildSettings = {\n" +
        "\t\tALWAYS_SEARCH_USER_PATHS = NO;\n" +
        "\t\tASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;\n" +
        "\t\tCLANG_ANALYZER_NONNULL = YES;\n" +
        "\t\tCLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;\n" +
        '\t\tCLANG_CXX_LANGUAGE_STANDARD = "gnu++20";\n' +
        "\t\tCLANG_ENABLE_OBJC_WEAK = YES;\n" +
        "\t\tCLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;\n" +
        "\t\tCLANG_WARN_DOCUMENTATION_COMMENTS = YES;\n" +
        "\t\tCLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;\n" +
        "\t\tCLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;\n" +
        "\t\tCLANG_WARN_UNGUARDED_AVAILABILITY = YES_AGGRESSIVE;\n" +
        "\t\tCODE_SIGN_STYLE = Automatic;\n" +
        "\t\tCOPY_PHASE_STRIP = NO;\n" +
        "\t\tCURRENT_PROJECT_VERSION = 1;\n" +
        '\t\tDEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";\n' +
        "\t\tENABLE_NS_ASSERTIONS = NO;\n" +
        "\t\tENABLE_USER_SCRIPT_SANDBOXING = YES;\n" +
        "\t\tGCC_C_LANGUAGE_STANDARD = gnu17;\n" +
        "\t\tGCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;\n" +
        "\t\tGCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;\n" +
        "\t\tGENERATE_INFOPLIST_FILE = YES;\n" +
        "\t\tINFOPLIST_FILE = NotificationServiceExtension/Info.plist;\n" +
        "\t\tINFOPLIST_KEY_CFBundleDisplayName = NotificationServiceExtension;\n" +
        '\t\tINFOPLIST_KEY_NSHumanReadableCopyright = "";\n' +
        "\t\tIPHONEOS_DEPLOYMENT_TARGET = 11.0;\n" +
        "\t\tLD_RUNPATH_SEARCH_PATHS = (\n" +
        '\t\t\t"$(inherited)",\n' +
        '\t\t\t"@executable_path/Frameworks",\n' +
        '\t\t\t"@executable_path/../../Frameworks",\n' +
        "\t\t);\n" +
        "\t\tLOCALIZATION_PREFERS_STRING_CATALOGS = YES;\n" +
        "\t\tMARKETING_VERSION = 1.0;\n" +
        "\t\tMTL_ENABLE_DEBUG_INFO = NO;\n" +
        "\t\tMTL_FAST_MATH = YES;\n" +
        "\t\tPRODUCT_BUNDLE_IDENTIFIER = com.wolkus.fasalapp.NotificationServiceExtension;\n" +
        '\t\tPRODUCT_NAME = "$(TARGET_NAME)";\n' +
        "\t\tSKIP_INSTALL = YES;\n" +
        "\t\tSWIFT_EMIT_LOC_STRINGS = YES;\n" +
        '\t\tTARGETED_DEVICE_FAMILY = "1,2";\n' +
        "\t\tVALIDATE_PRODUCT = YES;\n" +
        "\t};\n" +
        "\tname = Release;\n" +
        "\t\t};\n" +
        "/* End XCBuildConfiguration section */"
    );

    // Append XCConfigurationList section

    console.log(log + "Append XCConfigurationList section");

    cnt = cnt.replace(
      "/* End XCConfigurationList section */",

      '\t\tFFFFFFFFFFFFFFFFFFFFB33D /* Build configuration list for PBXNativeTarget "NotificationServiceExtension" */ = {\n' +
        "\t\t\tisa = XCConfigurationList;\n" +
        "\t\t\tbuildConfigurations = (\n" +
        "\t\t\tFFFFFFFFFFFFFFFFFFFF0074 /* Debug */,\n" +
        "\t\t\tFFFFFFFFFFFFFFFFFFFFE808 /* Release */,\n" +
        "\t\t\t);\n" +
        "\t\t\tdefaultConfigurationIsVisible = 0;\n" +
        "\t\t\tdefaultConfigurationName = Release;\n" +
        "\t\t};\n" +
        "/* End XCConfigurationList section */"
    );

    fs.writeFileSync(
      path.join(project, appName + ".xcodeproj/project.pbxproj"),
      cnt
    );

    console.log(log + "Source files and Frameworks installed");
  }

  // Entitlements

  //   ["Entitlements-Release.plist", "Entitlements-Debug.plist"].forEach((target) => {
  //     var cnt = fs.readFileSync(path.join(project, appName, target), "utf8");

  //     if (cnt.indexOf("<string>group." + projectid + ".onesignal</string>") > -1) {
  //       console.log(log + "App Group already created for " + target + " [Skip]");
  //     } else {
  //       if (cnt.indexOf("<key>com.apple.security.application-groups</key>") > -1) {
  //         cnt = cnt.replace(
  //           "<key>com.apple.security.application-groups</key>\n\t<array>",
  //           "<key>com.apple.security.application-groups</key>\n\t<array>\n\t\t<string>group." +
  //             projectid +
  //             ".onesignal</string>\t\t\t"
  //         );
  //       } else {
  //         cnt = cnt.replace(
  //           "</dict>\n</plist>",
  //           "\t<key>com.apple.security.application-groups</key>\n\t<array>\n\t\t<string>group." +
  //             projectid +
  //             ".onesignal</string>\n\t</array>\n</dict>\n</plist>"
  //         );
  //       }

  //       fs.writeFileSync(path.join(project, appName, target), cnt);

  //       console.log(log + "App Group created for " + target);
  //     }
  //   });

  // Dir

  var onesignalDir = path.join(project, "NotificationServiceExtension");

  if (!fs.existsSync(onesignalDir)) {
    fs.mkdirSync(onesignalDir);

    console.log(log + "Folder NotificationServiceExtension created");
  } else {
    console.log(
      log + "Folder NotificationServiceExtension already exists [Skip]"
    );
  }

  // Files

  fs.writeFileSync(
    path.join(onesignalDir, "Info.plist"),

    `<?xml version="1.0" encoding="UTF-8"?>

<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">

<plist version="1.0">

<dict>

	<key>CFBundleDevelopmentRegion</key>

	<string>$(DEVELOPMENT_LANGUAGE)</string>

	<key>CFBundleDisplayName</key>

	<string>NotificationServiceExtension</string>

	<key>CFBundleExecutable</key>

	<string>$(EXECUTABLE_NAME)</string>

	<key>CFBundleIdentifier</key>

	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>

	<key>CFBundleInfoDictionaryVersion</key>

	<string>6.0</string>

	<key>CFBundleName</key>

	<string>$(PRODUCT_NAME)</string>

	<key>CFBundlePackageType</key>

	<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>

	<key>CFBundleShortVersionString</key>

	<string>$(MARKETING_VERSION)</string>

	<key>CFBundleVersion</key>

	<string>$(CURRENT_PROJECT_VERSION)</string>

	<key>NSExtension</key>

	<dict>

		<key>NSExtensionPointIdentifier</key>

		<string>com.apple.usernotifications.service</string>

		<key>NSExtensionPrincipalClass</key>

		<string>NotificationService</string>

	</dict>

</dict>

</plist>`
  );

  console.log(log + "File Info.plist created");

  fs.writeFileSync(
    path.join(onesignalDir, "NotificationService.h"),

    `#import <UserNotifications/UserNotifications.h>



@interface NotificationService : UNNotificationServiceExtension



@end`
  );

  console.log(log + "File NotificationService.h created");

  fs.writeFileSync(
    path.join(onesignalDir, "NotificationService.m"),

    `
    #import "NotificationService.h"
#import "FirebaseMessaging.h"

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    self.contentHandler = contentHandler;
    self.bestAttemptContent = [request.content mutableCopy];
    
    [[FIRMessaging extensionHelper] populateNotificationContent:self.bestAttemptContent withContentHandler:contentHandler];
}

- (void)serviceExtensionTimeWillExpire {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    self.contentHandler(self.bestAttemptContent);
}

@end
    
    `
  );

  console.log(log + "File NotificationService.m created");

  console.log(log + "Installation finished");
};
