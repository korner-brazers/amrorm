var amData = {};

var amrorm = function(option){
    this.path            = option.pathToImages || '';
    this.animationObject = {};
    this.activeAnimate   = '';
    this.selectAnimID    = null;
    this.selectScin      = {};
    this.scinsID         = {};
    this.layers          = {};
    this.curentTime      = 0;
    this.position        = {x:0,y:0};
    this.rotation        = 0;
    this.sight           = {x:0,y:0};
}

amrorm.prototype = {
    loading: function(file,call){
        if(amData[file]) return this.parse(amData[file],call);
        
        var xmlhttp,scope = this;
        
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch(e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch(e) {
                xmlhttp = false;
            }
        }
        if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
            xmlhttp = new XMLHttpRequest();
        }
        
        if(xmlhttp){
            xmlhttp.open('GET', file, true);
            xmlhttp.onreadystatechange = function() {
                if(xmlhttp.readyState == 4){
                    if(xmlhttp.status == 200){
                        amData[file] = xmlhttp.responseText;
                        
                        scope.parse(xmlhttp.responseText,call);
                    }
                    else call();
                }
            };
            xmlhttp.send(null);
        }
        else call();
    },
    parse: function(str,call){
        try{
            var images = [];
            
            this.animationObject = JSON.parse(str);
            
            for(var i in this.animationObject.layers){
                var layer = this.animationObject.layers[i];
                
                if(layer.type == 'img'){
                    layer.image = layer.image.replace(/\\/g,'/');
                    
                    layer.image = this.path + layer.image.split('/').pop();
                    
                    images.push(layer.image);
                }
            }
            
            call(images);
        }
        catch(e){
            call();
        }
    },
    create: function(){
        if(this.animationObject){
            for(var i in this.animationObject.layers){
                var layer = JSON.parse(JSON.stringify(this.animationObject.layers[i]));
                
                if(this.onCreate) this.onCreate(layer);
                
                layer.position = {x:0,y:0};
                layer.scale    = {x:layer.scaleX,y:layer.scaleY};
                layer.anchor   = {x:layer.anchorX,y:layer.anchorY};
                layer.visible  = 1;
                layer.rotate   = 0;
                
                this.layers[i] = layer;
            }
            
            for(var i in this.animationObject.scins){
                this.scinsID[this.animationObject.scins[i].name] = i;
                this.selectScin[i] = this.animationObject.scins[i].selectdDefault;
            } 
        }
    },
    setPosition: function(position){
        this.position = position;
    },
    getLayer: function(name,call){
        for(var i in this.layers){
            var layer = this.layers[i];
            
            if(layer.layer.name == name){
                if(call) call(layer);
                else return layer;
            } 
        }
    },
    getPoints: function(call){
        for(var i in this.layers){
            var point = this.layers[i];
            
            if(point.type !== 'img'){
                if(call) call(this.layers[i]);
                else return this.layers[i];
            }
        }
    },
    setAnimate: function(name,option){
        if(!option) option = {};
        
        if(this.animationObject){
            if(this.activeAnimate !== name){
                this.activeAnimate = false;
                
                for(var i in this.animationObject.animations){
                    var animate = this.animationObject.animations[i];
                    
                    if(name && animate.name == name){
                        this.activeAnimate = name;
                        this.selectAnimID  = animate;
                    } 
                    else if(!name && animate.name.selectdDefault){
                        this.activeAnimate = name;
                        this.selectAnimID  = animate;
                    } 
                }
                
                this.curentTime = option.useAmount && this.selectAnimID ? this.selectAnimID.time * option.useAmount : 0;
            }
            
            if(option.useAmount && this.selectAnimID) this.curentTime = this.selectAnimID.time * option.useAmount;
        }
    },
    scin: function(name,visible){
        var scinID = this.scinsID[name];
        
        if(scinID){
            if(visible) this.selectScin[scinID] = 1;
            else this.selectScin[scinID]        = 0;
        }
    },
    valueAnimate: function(id,object){
        if(this.selectAnimID && this.selectAnimID.anim[id]){
            var anim = this.selectAnimID.anim[id];
            
            var i = 0;
        	var n = anim.length;
            
            if(n > 0){
                function setValuesAnim(m){
                    for(var x in anim[m]){
                        if(object[x] !== undefined) object[x] = anim[m][x];
                    }
                }
                
            	while(i < n && this.curentTime > anim[i].time) i++;
                
            	if (i == 0){
            	   setValuesAnim(0)
            	}
            	else if (i == n){
            	   setValuesAnim(n-1)
            	}
                else{
                    var poin = (this.curentTime - anim[i-1].time) / (anim[i].time - anim[i-1].time);

                    var t = this.curentTime - anim[i-1].time;
                    var d = anim[i].time - anim[i-1].time;
                    var c = 1;
                    
                    if(anim[i].typeKey == 'easeIn') poin = c*(t/=d)*t;
                    else if(anim[i].typeKey == 'easeOut') poin = -c *(t/=d)*(t-2);
                    
                    
                    for(var x in anim[i]){
                        if(object[x] !== undefined){
                            object[x] = anim[i-1][x] + poin * (anim[i][x] - anim[i-1][x]);
                        } 
                    }
                }
            }
        }
        
        return object;
    },
    offsetPoint: function(x,y,a,offsetX,offsetY){
        return {
            x: x + Math.cos(a)*offsetX - Math.sin(a)*offsetY,
            y: y + Math.sin(a)*offsetX + Math.cos(a)*offsetY
        };
    },
    To360: function(radians){
        var degrees = radians * (180/Math.PI);
        
        if(degrees < 0) return 360 + degrees;
        else return degrees;
    },
    ToRadian: function(degrees){
        var radians = degrees * (Math.PI/180);
        
        if(radians > Math.PI) return -(Math.PI*2 - radians);
        else return radians;
    },
    calculateAngle: function(Angle,toAngle,smoothVar){
        var cof = Angle - toAngle,
            ger = 0,
            del = addDelta(smoothVar);
    
        if(cof > Math.PI)  cof -= 2 * Math.PI;
        if(cof <- Math.PI) cof += 2 * Math.PI;
        
        if(cof > del) ger=+del;
        else if(cof <- del) ger=-del;
        else ger = Angle - toAngle;
        
        return Angle - ger; 
    },
    ToAngleObject: function(object1,object2){
     
        var point1 = object1.position ? object1.position : object1;
        var point2 = object2.position ? object2.position : object2;
        
        return Math.atan2(point2.y - point1.y,point2.x - point1.x);
    },
    ToMaxAngle: function(a,c,max){
        var cof = a - c;
        
        if(cof > Math.PI)  cof -= 2 * Math.PI;
        if(cof <- Math.PI) cof += 2 * Math.PI;
    
        if(cof > max || cof <- max) return cof > max ? c+(cof-max) : c+(cof+max);
        else return c;
    },
    update: function(){
        
        if(this.activeAnimate){
            this.curentTime += 0.02;
            
            if(this.callTimeEnd && this.curentTime >= this.selectAnimID.time) this.callTimeEnd();
            
            this.curentTime = this.curentTime >= this.selectAnimID.time ? (this.selectAnimID.loop ? 0 : this.selectAnimID.time) : this.curentTime;
        }
                    
                    
        for(var i in this.layers){
            var object = this.valueAnimate(i,this.layers[i]);                    
            var parent = this.layers[object.parent];
            
            if(parent){
                var position = this.offsetPoint(
                    parent.position.x,
                    parent.position.y,
                    parent.rotate,
                    object.offsetX,
                    object.offsetY
                )
            }
            else{
                var position = this.offsetPoint(
                    this.position.x,
                    this.position.y,
                    this.rotation,
                    object.offsetX,
                    object.offsetY
                )
            }
            
            
            object.position.x = position.x;
            object.position.y = position.y;
            
            object.anchor.x = object.anchorX;
            object.anchor.y = object.anchorY;
            
            object.scale.x = object.scaleX;
            object.scale.y = object.scaleY;
            object.visible = this.selectScin[object.scinSelect] ? object.visible : !object.scinSelect ? object.visible : 0;
            object.alpha   = object.opacity;
            
                
                
            var rotation = object.watchOfCursor ? this.ToMaxAngle(this.rotation,this.ToAngleObject(this.position,this.sight),object.maxAngle): parent ? parent.rotate+this.ToRadian(object.rotation) : this.ToRadian(object.rotation)+this.rotation;
            
            
            object.rotate = rotation && object.watchSmooth ? this.calculateAngle(object.rotate,rotation,object.watchSmooth) : rotation;
            
            
            if(this.onUpdate) this.onUpdate(object)
        }
    },
    destroy: function(){
        for(var i in this.layers){
            var layer = this.layers[i];
            
            if(this.onDestroy) this.onDestroy(layer);
        }
    }
}