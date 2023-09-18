function a(){
    console.log('A');
}
var a = function(){
    console.log('A');
}//위 함수와 같음


function slowfunc(callback){
    callback();
}

slowfunc(a);