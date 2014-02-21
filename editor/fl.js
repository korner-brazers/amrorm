var fs  = require('fs');
var edi = function(option){};

edi.prototype = {
    pathData: function(name){
        return nwDir+'/'+accessKey+'/'+name+'.data.json';
    },
	openFile: function(name,call){
		fs.readFile(this.pathData(name), 'utf-8', function(error, contents) {
            call(contents);
        })
	},
    openFileSimple: function(path){
        try{
            return fs.readFileSync( nwDir + path ).toString();
        }
        catch(e){
            return '';
        }
    },
    openFilePath: function(path){
        try{
            return fs.readFileSync( path ).toString();
        }
        catch(e){
            return '';
        }
    },
    openJson: function(name,call){
        this.openFile(name,function(str){
            try{
                var json = JSON.parse(str);
            }
            catch(e){
                var json = {};
            }
            
            call(json);
        });
    },
    saveFilePath: function(path,str){
        if(!fs.existsSync(path)) fs.openSync(path, 'w');
            
        fs.writeFile(path, str);
    },
    saveFile: function(name,str){
        if(!fs.existsSync(this.pathData(name))) fs.openSync(this.pathData(name), 'w');
            
        fs.writeFile(this.pathData(name), str);
    },
    saveJson: function(name,arr,error){
        try{
            this.saveFile(name,JSON.stringify(arr));
            error && error()
        }
        catch(e){
            error && error(true)
        }
    },
    saveJsonAndID: function(name,id,saveArr,call){
        
        var scope = this;
            
        this.openJson(name,function(getJson){
            var iid = id || hash('_a');
            
            var merge = {}
            
            if(id) getJson[id]  = saveArr;
            else{
                merge[iid] = saveArr;
                getJson    = scope.mergeID(merge,getJson);
            }
            
            scope.saveJson(name,getJson)
            
            if(call){
                call({
                    arr: getJson[iid],
                    id: iid
                })
            }
        })
    },
    saveJsonAndDelete: function(name,id,call){
        var scope = this;
        
        this.openJson(name,function(getJson){
            delete getJson[id];
            
            scope.saveJson(name,getJson);
            
            call(getJson);
        })
    },
    jsonToArray: function(str){
        try{
            var json = JSON.parse(str);
        }
        catch(e){
            var json = [];
        }
        
        return json;
    },
    mergeID: function(obj1,obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    },
    saveScripts: function(){
        
    },
    scripts: function(action,name,arr,call){
        if(action == 'new'){
            var str  = "return {\n";
                str += "    startAction: function(){\n        \n    },\n";
                str += "    updateAction: function(){\n        \n    },\n";
                str += "    destroyAction: function(){\n        \n    }\n";
                str += "}";
            
            fs.writeFile(nwDir+'/data/scripts/'+name+'.js', str);
            
            this.saveScripts(arr)
            call();
        }
        else if(action == 'get'){
            this.openJson('scripts',call)
        }
        else if(action == 'save'){
            this.saveScripts(arr)
        }
        else if(action == 'delAndSave'){
            this.saveScripts(arr)
        }
        else if(action == 'checkName'){
            if (path.existsSync(nwDir+name)) call(true)
            else call();
        }
    },
    readFolder: function(dir,call){
        fs.readdir(nwDir+'/'+(dir ? dir+'/' : ''), function(error, files) {
            var readFiles = {
                file: [],
                dir: []
            }
            
            if(error) call(readFiles);
            else{
                for(var i in files){
                    var file = files[i];
                    
                    var stat = fs.statSync(nwDir+'/'+(dir ? dir+'/' : '')+file);
                    
                    if(stat && stat.isDirectory()) readFiles.dir.push(file);
                    else readFiles.file.push(file);
                    
                }
                
                call(readFiles);
            }
        });
    },
    getObjects: function(call){
        var arr   = {};
        var scope = this;

        this.readFolder(accessKey,function(scanFile){
            
            for(var i in scanFile.file){
                var fileName = scanFile.file[i];
                var name     = fileName.replace(/\.data\.json/gi,'');
                
                arr[name] = fs.readFileSync( nwDir + "/" + accessKey + "/" + fileName );
                arr[name] = scope.jsonToArray(arr[name]);
            }
            
            call(arr)
        });
    },
    saveZone: function(id,json){
        this.saveFilePath(nwDir+'/map/zone/'+id+'.base',JSON.stringify(json));
    }
}

var ediManager = new edi();