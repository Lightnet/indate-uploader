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

var getChecksums = function (files, callback) {
  //variable to hold checksums
  var checksums = [];

  //get checksums
  files.forEach(function (file) {

    checksum.file(file, function(err, sum ){
      if ( err ) callback(err);

      var path = file.split('/');
      var filename = path[path.length-1];
      checksums.push({ path: '/files/' + filename, sum: sum });

      //if all the checksums are complete run callback
      if( checksums.length === files.length ) {
        callback(null, checksums);
      }

    });

  });
}

//uploading


//start code

//variables
var config = getConfig('./projects.json');
var updateData = {
  projects : []
};

var processProject = function (projectList, index) {
  index = (index === undefined)? 0 : index;

  if ( index < projectList.length ) { //check if there are more projects to process.
    var project = projectList[index];

    //updating user
    console.log('Doing project: ' + project.identity );

    //get list of files and move them to temporary folder
    var fileList = listFiles(project.build_path);
    var newpath = './tmp/' + project.identity + '/';

    fs.mkdirRecursive(newpath + '/files/', function(err) { //make tmp directory
      if (err) throw err;

      //update user
      console.log("Moving files and making checksums...");

      fs.copyRecursive(project.build_path, newpath + '/files/', function(err) { //move project files to tmp
        if (err) throw err;

        getChecksums(fileList, function(err, filesAndChecksums ) { //get checksums for files and save update.json file
          if (err) throw err;

          //update user
          console.log("Writing project data...");

          var projectData = {
            project: project.identity,
            files: filesAndChecksums
          }

          fs.writeFile(newpath + 'update.json', JSON.stringify(projectData, 4), 'utf8', function(err) {
            if (err) throw err;

            console.log('Beginning upload to server...');

            var Sftp = require('sftp-upload');
            sftp = new Sftp({
              host: project.host,
              username: project.user,
              password: project.password,
              port: project.port,
              path: "./tmp",
              remoteDir: project.ftp_path + "/indate"
            });

            sftp.on("error", console.log);
            sftp.on("uploading", function(update){
              console.log(update.file);
              console.log("percent: " + update.percent);
            });
            sftp.on("completed", function(){
              fs.rmrfSync('./tmp'); //remove tmp directory
              console.log("uploading project " + project.identity + " COMPLETE");
              console.log("#---------------------------------------------#");

              //try to run next project
              processProject(projectList, index+1);
            });

            sftp.upload();

          });
        });
      });
    });
  }
};

processProject(config.projects, 0);


