// Module: FileLineReader
// Constructor: FileLineReader(filename, bufferSize = 8192)
// Methods: hasNextLine() -> boolean
//          nextLine() -> String
//
//
var fs = require('./node-fs/lib/fs');

exports.FileLineReader = function(filename, bufferSize) {

    bufferSize = bufferSize || 8192;

    //private:
    var currentPositionInFile = 0;
    var buffer = "";
    var fd = fs.openSync(filename, "r");


    // return -1
    // when EOF reached
    // fills buffer with next 8192 or less bytes
    var fillBuffer = function(position) {

        var res = fs.readSync(fd, bufferSize, position, "ascii");

        buffer += res[0];
        if (res[1] == 0) {
            return -1;
        }
        return position + res[1];

    };

    currentPositionInFile = fillBuffer(0);

    //public:
    this.hasNextLine = function() {
        while (-1 == buffer.indexOf("\n")) {
            currentPositionInFile = fillBuffer(currentPositionInFile);
            if (-1 == currentPositionInFile) {
                return false;
            }
        }

        if (-1 < buffer.indexOf("\n")) {

            return true;
        }
        return false;
    };

    //public:
    this.nextLine = function() {
        var lineEnd = buffer.indexOf("\n");
        var result = buffer.substring(0, lineEnd);

        buffer = buffer.substring(result.length + 1, buffer.length);
        return result;
    };

    return this;
};