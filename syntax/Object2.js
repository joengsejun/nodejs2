//array, object
//every start f function ↓
var f = function(){
    console.log(1+1);
    console.log(1+2);
}
var a = [f];
a[0]();

var o = {
    func : f
}
o.func();

//error code ↓
//var i = if(true){console.log(1)};
//var w = while(true){console.log(1)};