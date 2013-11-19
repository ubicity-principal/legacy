/**
* This file is part of a proof of concept implementation of a biodiversity 
* surveying application, which was developed by AIT Austrian Institute of 
* Technology GmbH within FP7 ENVIROFI research project. 
* It demonstrates the use of MDAF - Mobile Data Acquisition Framework 
* (renamed "ubicity" in 09/2013)  
* 
* See <catalogue.envirofi.eu/> and <www.envirofi.eu/> for more details.
* More information on ubicity at <www.ubicity.eu/?>
* 
* This prototype is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* any later version.
*
* This software is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with the sources.  If not, see <http://www.gnu.org/licenses/>.
**/
/**
  * @file js/fileUtils.js
  * @authors Maria Egly
  * @copyright Austrian Institute of Technology, 2013
  * @short Utility functions for file handling with phonegap.
  */

var fileCount = 0;
var fileDir = null;
var fileArray = null;
var fileNumber = 0;
var maxFiles = 0;

/**
 * @brief Removes the oldest files from a directory so that directory 
 *        contains not more than a given maximum number of files .
 * @param[in] path name of directory.
 * @param[in] maxEntries number of files to keep in directory.
 */
function removeOldFiles(directory, maxEntries) {
    maxFiles = maxEntries;
    fileCount = 0;
    fileArray = new Array();
    fileNumber = 0;
    fileDir = directory;
    getDirectorySorted();
}

function removeFiles() {
    for (var i = 0; i < fileArray.length - maxFiles; i++) {
        fileArray[i][0].remove();
    }   
}

/* get the root file system */
function getDirectorySorted() {
    window.requestFileSystem(
        LocalFileSystem.PERSISTENT, 
        0,
        function(fileSystem) { 
            // success get file system
            root = fileSystem.root;
            root.getDirectory(fileDir, {create: false, exclusive: false}, getDirSuccess, dirFail);
        }, 
        function(evt) { 
            // error get file system
            console.log("File System Error: "+ evt.target.error.code);
        }
    );
}

function getDirSuccess(dirEntry) {
    // Get a directory reader
    var directoryReader = dirEntry.createReader();
    // Get a list of all the entries in the directory
    directoryReader.readEntries(readerSuccess, fail);
}

function getFileSuccess(fileEntry) {
    fileArray[fileCount] = new Array(3);
    fileArray[fileCount][0] = fileEntry;
    fileArray[fileCount][1] = fileEntry.name;
    fileCount++;
    fileEntry.file(setTime, null);
}

function setTime(file) {
    // Get time string of file and convert it to epoch
    var m = new Date(file.lastModifiedDate).getTime() / 1000;
    // Store file path and time in 2 dimensional array
    for (var i = 0; i < fileArray.length; i++) {
        if (fileArray[i][1] == file.name) {
            fileArray[i][2] = m;
            break;
        }
    }
    // let's see if all files have got their timestamp:
    var arrayReady = true;
    for (var j = 0; j < fileNumber && arrayReady == true; j++) {
        if (fileArray[j] == undefined || fileArray[j][2] == undefined) {
            arrayReady = false;
        }
    }
    if (arrayReady) {
        // Sort files by time
        fileArray.sort((function(index){
            return function(a, b){
                return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
            };
        })(2)); // 2 is the index of the timestamp
        removeFiles();
    }
}

function readerSuccess(entries) {
    if (entries.length > maxFiles) {
        var i;
        fileNumber = entries.length;
        for (i = 0; i < entries.length; i++) {
            root.getFile(fileDir + "/" + entries[i].name, null, getFileSuccess, fail);
        }
    }
}

function dirFail(error) {
    console.log("Error reading directory " + fileDir + ": " + error.code);
}

function fail(error) {
    console.log("Error reading file: " + error.code);
}