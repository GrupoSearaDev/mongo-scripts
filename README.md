# Welcome to mongo-scripts

Note: The package.json contains the modules that were uploaded in mongo as an external dependency, it contains the versions needed.
If you want to add more then just the usual npm install and run the following code line 
### `tar -czf node_modules.tar.gz node_modules/`

That line of code will create a somewhat zip file that you can upload.
more info: https://docs.mongodb.com/realm/functions/upload-external-dependencies/

# Template

``exports = function(arg){
  /*
    Accessing application's values:
    var x = context.values.get("value_name");

    Accessing a mongodb service:
    var collection = context.services.get("mongodb-atlas").db("dbname").collection("coll_name");
    collection.findOne({ owner_id: context.user.id }).then((doc) => {
      // do something with doc
    });

    To call other named functions:
    var result = context.functions.execute("function_name", arg1, arg2);

    Try running in the console below.
  */
  return {arg: arg};
};``