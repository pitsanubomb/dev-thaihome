// dataController
exports.getData = function(req) {
    return new Promise((resolve, reject) => {
















        if (req.myValue) {

            console.log("Data received: " + JSON.stringify(req, null, 4));
            console.log("Doing lots of mongodb work taking milliseconds to minutes")
            setTimeout(function(){
                resolve({"myValue":req.myValue+1000 });
            }, req.myValue);

        } else {

            reject("myValue missing!!");
            
        }

    });
};