# Indate Uploader
Indate is a patching system focusing on simple technologies everyone can have access. Namely ftp and static http. It combines two programs, a launcher/updater and an uploader. The uploader uploads projects to a normal server through sftp/ftp and the launcher downloads updates on a per file basis using checksums through normal http/https.

This is the project uploader component of the system.

### Main Features
- Upload infinite number of projects with one program.
- Whole project sftp uploading.
- Generates checksums of each file and uploads to server for file comparison.

### Setup
- Copy "projects-default.json" to "projects.json".
- Input your project location and other information.
	- indentity is a unique id for indate and should be the same for the patcher to point to the right project.
- Input the ftp server information.
	- It's safe to put sensitive information here since the file is ignored by git and this part of Indate never goes out to users.
- run "node ./src/main.js"

### Future Updates
- There's some general bugs hiccups I'd like to fix.

### Known Problems
- If a problem occurs and the "tmp" directory is left behind, delete it or it will fail again.

### Indate Patcher
This is the actual patcher component that goes out to users.

https://github.com/zaywolfe/indate-patcher
