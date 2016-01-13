var fs = require('fs.extra');
var checksum = require('checksum');

//config
var getConfig = function ( path ) {
  if( fs.existsSync(path) ) {
    return JSON.parse( fs.readFileSync( path, 'utf8' ) );
  } else {
    console.log("projects.json does not exit. Creat projects.json to continue.")
    setTimeout(function(){process.exit(0)}, 2000);
  }
};

//uploader


//files
var getProjectFiles = function (project, callback) {
  var files = listFiles(project.build_path);
  var newpath = './tmp/' + project.identity + '/';

  fs.mkdirRecursive( './tmp/' + project.identity, function(err){
    console.log('jar');

    if (err){

      console.error(err);

    } else {

      fs.copyRecursive( project.build_path, newpath, function(err){
        if (err)
          console.error(err);
        else
          callback(null, newpath);
      });

    }

  });

  console.log('babar');

}


var listFiles = function ( path, fileList ) {
  fileList = fileList || [];
  path = ( path[path.length-1] === '/' )? path : path + '/';
  var hotFiles = fs.readdirSync( path );


  hotFiles.forEach(function (file) {
    if ( fs.statSync(path+file).isDirectory() ) {

      fileList = listFiles( path+file+'/', fileList );

    } else {

      fileList.push(path + file)

    }

  });

  return fileList;

}

var getChecksums = function (path, callback) {
  var files = listFiles(path);
  //variable to hold checksums
  var checksums = [];

  //get checksums
  files.forEach(function (file) {

    checksum.file(file, function(err, sum ){
      if ( err ) callback(err);

      var path = file.split('/');
      var filename = path[path.length-1];
      checksums.push({ filename: sum });

      //if all the checksums are complete run callback
      if( checksums.length === files.length ) {
        callback(null, checksums);
      }

    });

  });
}

//start code

//variables
var config = getConfig('./projects.json');
var projectIndex = 0;
var currentProject = {};
var tmpPath = '';
var exit = false;
var state = 1;

while(!exit) {

  switch ( state ) {

    case 1://getting project files together
      console.log("moving files...");

      if ( config.projects.length > 0 ) {

        currentProject = config.projects[projectIndex];
        getProjectFiles(currentProject, function (err, newpath) {
          if (err) throw err;

          console.log("done");
          tmpPath = newpath;
          state = 2;
        });

      } else {//there are no projects configured
        console.log( "please list projects in projects.json");
        process.exit(0);
      }
      state = 0;
      break

    case 2://save checksums
      getChecksums( './tmp/' + currentProject.identity , function (err, checksums) {
        if (err) throw err;

        console.log(checksums);
        exit = true;

      });
      state = 0;
      break;


    default:
      //wait for state to change
      break;
  }
}
