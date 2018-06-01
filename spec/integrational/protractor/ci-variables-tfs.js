process.env["TF_BUILD"]                       = true;
process.env["BUILD_BUILDNUMBER"]              = '1.0.286408';
process.env["BUILD_BUILDID"]                  = '286408';
process.env["BUILD_SOURCEBRANCHNAME"]         = 'master';
process.env["BUILD_SOURCEVERSION"]            = 'sha';
process.env["BUILD_DEFINITIONNAME"]           = 'a/b';
process.env["BUILD_SOURCEVERSIONMESSAGE"]     = 'commit';
process.env["SYSTEM_TEAMFOUNDATIONSERVERURI"] = 'http://tfsServer:8080/tfs/Collection/';
process.env["SYSTEM_TEAMPROJECT"]             = 'MyProjectName';
process.env["BUILD_TAGS"]                     = ["tag1, tag2"];

require("../angularjs-homepage-simple-failure-test.js");
