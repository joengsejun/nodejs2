var fs = require('fs');
fs.readFile('semple.txt', 'utf8', function(err, data){
    console.log(data);
});