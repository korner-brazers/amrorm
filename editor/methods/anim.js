var layersBox,
    animBox,
    skinBox,
    opLeft;
    
var layersGroup,
    rootsGroup,
    spritesAnim = {};
    
var animCns = {},
    selectAnimID,
    selectSkinID = {},
    selectAnimParentID,
    curentTime = 0,
    played,
    loop,
    sliderPlay;
    
var moved = false
var time  = $('#timeAnim');
var delta = 0;

        
methods.animLayer = function(){
    var anim = new Kinetic.Animation(function(frame){
        delta = frame.timeDiff / 1000;
        
        var isPlayed = (animCns.played && selectAnimID) || animCns.sliderPlay ? true : false;
        
        if(isPlayed && !animCns.sliderPlay){
            
            curentTime += delta;
            curentTime = curentTime >= selectAnimID.time ? (animCns.loop ? 0 : selectAnimID.time) : curentTime;
           
            animCns.slider.setX((animCns.width/selectAnimID.time)*curentTime);
        }
        
        if(selectAnimID && animCns.sliderUpdate) animCns.slider.setX((animCns.width/selectAnimID.time)*curentTime);
        
        time.text(curentTime.toFixed(3))
        
        animCns.layer.draw();
        
        transformBox.update();
        
        for(var i in spritesAnim){
            var sprite = spritesAnim[i];
            var object = isPlayed ? methods.valueAnim(i,sprite.linkObject) : sprite.linkObject;                    
            var parent = spritesAnim[sprite.linkObject.parent];
            
            if(parent){
                var parentPosition = parent.getPosition();
                
                var position = OffsetPoint(
                    parentPosition.x,
                    parentPosition.y,
                    parent.getRotation(),
                    object.offsetX,
                    object.offsetY
                )
            }
            else{
                var center   = methods.getCenter();
                var position = OffsetPoint(
                    center.x,
                    center.y,
                    0,
                    object.offsetX,
                    object.offsetY
                )
            }
            
            sprite.setAttrs({
                position: position,
                offset: object.type == 'img' ? [sprite.getWidth() * object.anchorX,sprite.getHeight() * object.anchorY] : [0,0],
                scale: {
                    x: object.scaleX,
                    y: object.scaleY
                },
                visible: selectSkinID[object.skinSelect] ? object.visible : !object.skinSelect ? object.visible : 0,
                opacity: object.opacity
            })
            
            var cor = methods.getStageCursor();
            
            var rotation = object.watchOfCursor ? ToMaxAngle(0,ToAngle(position.x,position.y,cor.x,cor.y),object.maxAngle): parent ? parent.getRotation()+ToRadian(object.rotation) : ToRadian(object.rotation);
            
                rotation = rotation && object.watchSmooth ? calculateAngle(sprite.getRotation(),rotation,object.watchSmooth) : rotation;
                
                sprite.setRotation(rotation)
        }
        
        animCns.sliderPlay = animCns.sliderUpdate = false;
    }, graphicsLayer);
            
    anim.start();
}

methods.valueAnim = function(id,object){
    if(selectAnimID && selectAnimID.anim[id]){
        var anim = selectAnimID.anim[id];
        
        var i = 0;
    	var n = anim.length;
        
        if(n > 0){
            function setValuesAnim(m){
                for(var x in anim[m]){
                    if(object[x] !== undefined) object[x] = anim[m][x];
                }
            }
            
        	while(i < n && curentTime > anim[i].time) i++;
            
        	if (i == 0){
        	   setValuesAnim(0)
        	}
        	else if (i == n){
        	   setValuesAnim(n-1)
        	}
            else{
                if(animCns.stepPlay){
                    setValuesAnim(i);
                }
                else{
                    var poin = (curentTime - anim[i-1].time) / (anim[i].time - anim[i-1].time);

                    var t = curentTime - anim[i-1].time;
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
    }
    
    return object;
}

methods.setCenter = function(position){
    return {
        x: sizeCns[0]/2+position.x,
        y: sizeCns[1]/2+position.y
    }
}

methods.getCenter = function(position){
    return {
        x: sizeCns[0]/2,
        y: sizeCns[1]/2
    }
}

methods.addAnimation = function(i,n,isNew){
    var boxAdd = $([
        '<li class="'+(selectAnimID && selectAnimID.id == i ? ' active' : '')+' animations hover"><div class="nameItem">'+n.name+'</div></li>'
    ].join(''));
    
    boxAdd.on('click',function(){
        opLeft.empty();
        
        $('li',animBox).removeClass('active');
        $(this).addClass('active');
        
        methods.opValI('input',{name:'Название',obj:n,value:'name'},opLeft,function(v){
            boxAdd.find('.nameItem').text(v);
        });
        
        methods.opValI('number',{name:'Время (сек)',obj:n,value:'time',step: 0.1,fix:2,min:0},opLeft,function(){
            methods.initAnimKeys()
        });
        methods.opValI('checkbox',{name:'По дефолту',obj:n,value:'selectdDefault'},opLeft);
        
        methods.opValI('checkbox',{name:'Повторить',obj:n,value:'loop'},opLeft);
        
        $.sl('update_scroll');
        
        selectAnimID = n;
        animCns.slider.setVisible(1);
        methods.initAnimKeys();
        animCns.sliderPlay = true;
    })
    
    boxAdd.on('contextmenu',function(e){
        e.preventDefault();
        
        $(this).sl('menu',{
            'Удалить':function(){
                delete loadAnim.animations[i];
                
                if(selectAnimID.id == i){
                    selectAnimID = null;
                    methods.initAnimKeys()
                }
                
                $(this).remove();
                opLeft.empty()
                $.sl('update_scroll');
            },
            'Клонировать':function(){
                var id = hash('_');
                
                loadAnim.animations[id] = JSON.parse(JSON.stringify(n));
                
                methods.initAnimations()
            }
        },{
            position: 'cursor',
            conteiner: window
        })
    })
    
    boxAdd.appendTo(animBox)
    
    if(isNew) boxAdd.click()
}

methods.addSkin = function(i,n,isNew){
    var boxAdd = $([
        '<li class="'+(selectSkinID && selectSkinID.id == i ? ' active' : '')+' skins hover"><div class="nameItem">'+n.name+'</div></li>'
    ].join(''));
    
    boxAdd.on('click',function(){
        opLeft.empty();
        
        methods.opValI('input',{name:'Название',obj:n,value:'name'},opLeft,function(v){
            boxAdd.find('.nameItem').text(v);
        });
        
        methods.opValI('checkbox',{name:'По дефолту',obj:n,value:'selectdDefault'},opLeft);
        
        $.sl('update_scroll');
        
        $(this).toggleClass('active');
        
        if($(this).hasClass('active')) selectSkinID[i] = n;
        else delete selectSkinID[i];
    })
    
    boxAdd.on('contextmenu',function(e){
        e.preventDefault();
        
        $(this).sl('menu',{
            'Удалить':function(){
                delete loadAnim.skins[i];
                
                $(this).remove();
                opLeft.empty()
                $.sl('update_scroll');
            },
            'Клонировать':function(){
                var id = hash('_');
                
                loadAnim.skins[id] = JSON.parse(JSON.stringify(n));
                
                methods.initSkins()
            }
        },{
            position: 'cursor',
            conteiner: window
        })
    })
    
    boxAdd.appendTo(skinBox)
    
    if(isNew) boxAdd.click()
}

methods.resortAnimKey = function(anim){
    anim.sort(function(i,ii){
        if (i.time > ii.time) return 1;
        else if (i.time < ii.time) return -1;
        else return 0;
    })
}

methods.addAnimationKey = function(i,n,anim){
    if(n.typeKey == 'easeIn'){
        var key = animCns.key.clone();
            key.setRotation(0);
    }
    else if(n.typeKey == 'easeOut'){
        var key = animCns.keyCircle.clone();
    }
    else {
        var key = animCns.key.clone();
    }
    
    key.setPosition({
        x: (animCns.width/anim.time)*n.time,
        y: 0
    })
    
    key.on('dragmove',function(){
        var x = key.getX();
            x = x < 0 ? 0 : (x > animCns.width ? animCns.width : x);
        
        key.setY(0);
        key.setX(x);
        
        n.time = anim.time / (animCns.width/x);
    })
    
    key.on('dragend',function(){
        methods.resortAnimKey(anim.anim[selectAnimParentID])
    })
    
    key.on('click',function(){
        curentTime = n.time;
        animCns.sliderPlay = true;
        animCns.slider.setX((animCns.width/selectAnimID.time)*curentTime);
    })
    
    key.on('mouseover',function(e){
        animCns.hoverKey = n;
    })
    
    key.on('mouseout',function(e){
        animCns.hoverKey = null;
    })
    
    animCns.groupKeys.add(key)
}

methods.initAnimations = function(isNew){
    animBox.empty();
    
    for(var i in loadAnim.animations) methods.addAnimation(i,loadAnim.animations[i],i == isNew ? isNew : 0);
    
    $.sl('update_scroll');
}

methods.initSkins = function(isNew){
    skinBox.empty();
    
    for(var i in loadAnim.skins) methods.addSkin(i,loadAnim.skins[i],i == isNew ? isNew : 0);
    
    $.sl('update_scroll');
}
    
methods.initAnimKeys = function(){
    animCns.groupKeys.removeChildren();
    
    if(selectAnimID && selectAnimParentID){
        if(selectAnimID.anim[selectAnimParentID]){
            methods.resortAnimKey(selectAnimID.anim[selectAnimParentID])
            
            for(var i in selectAnimID.anim[selectAnimParentID]) methods.addAnimationKey(i,selectAnimID.anim[selectAnimParentID][i],selectAnimID);
        } 
    }
    
    if(selectAnimID) animCns.slider.setVisible(1);
}
    
methods.updateVis = function(){
    transformBox.detach();
    layersGroup.removeChildren();
    rootsGroup.removeChildren();
    
    spritesAnim = {};
    
    for(var i in loadAnim.layers) methods.addNewSprite(i,loadAnim.layers[i]);
    
    selectAnimParentID = null;
    methods.initAnimKeys()
}

methods.addNewSprite = function(i,b){
    var position = methods.getCenter();
    
    if(b.type == 'root'){
        var sprite = new Kinetic.Circle({
            position: position,
            radius: 3,
            fill: '#ff8400',
            rotation: 0
        });
        
        rootsGroup.add(sprite);
    }
    else{
        var sprite = new Kinetic.Image({
            position: position,
            image: new Image(),
            rotation: 0,
            id: i
        });
        
        loadImg(nwDir+b.image,false,function(imageObj,w,h){
            sprite.setImage(imageObj)
        })
        
        layersGroup.add(sprite);
    }
    
    sprite.linkObject = b;
    spritesAnim[i]    = sprite;
    
    sprite.on('mousedown',function(){
        methods.layerOption(b);
        methods.atachToTransform(sprite,b);
        methods.initAnimKeys();
    })
}

methods.addNewLayer = function(){
    function newLayerAnim(type,img){
        var id = hash('_');
    
        loadAnim.layers[id] = {
            id: id,
            name: 'Слой',
            type: type,
            image: img || '',
            watchOfCursor: 0,
            watchSmooth: 0,
            anchorX: 0.5,
            anchorY: 0.5,
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            visible: 1,
            maxAngle: 3.14,
            opacity: 1,
            tracer: '',
            parent: ''
        }
        
        methods.initLayers();
        methods.updateVis();
    }
    
    $.sl('big_select','Тип слоя',{
        menu:[
            ['Точка','Своего рода кость',function(){
                newLayerAnim('root');
            }],
            ['Слой','Слой в качестве картинки',function(){
                methods.selectImg('',function(img){
                    newLayerAnim('img',img);
                })
            }],
        ]
    })
}

methods.deleteAnimLayer = function(id){
    for(var i in loadAnim.animations){
        var anim = loadAnim.animations[i];
        
        if(anim.anim[id]) delete anim.anim[id];
    }
}
    
methods.layerOption = function(n){
    
    opLeft.empty();
        
    $('span',layersBox).removeClass('active');
    
    var box = $('#'+n.id+' > span',layersBox).addClass('active');
    
    methods.opValI('input',{name:'Название',obj:n,value:'name'},opLeft,function(v){
        box.text(v)
    });
    
    if(n.type == 'img'){
        methods.opValI('images',{name:'Изображение',obj:n,value:'image'},opLeft,function(src,imgName){
    		loadImg(nwDir+src,false,function(imageObj,w,h){
                var img = layersGroup.get('#'+n.id)[0];
                
                if(img) img.setImage(imageObj)
    		})
    	});
    }
    
    methods.opValI('checkbox',{name:'Видимый',obj:n,value:'visible'},opLeft);
    methods.opValI('checkbox',{name:'Твердый',obj:n,value:'solid'},opLeft);
    methods.opValI('checkbox',{name:'Следить',obj:n,value:'watchOfCursor'},opLeft);
    methods.opValI('number',{name:'Сгладить',obj:n,value:'watchSmooth',min: 0,step: 0.004,fix: 3},opLeft);
    methods.opValI('number',{name:'Мак. угол',obj:n,value:'maxAngle',min: 0,step: 0.004,fix: 3,min:0,max: 3.14},opLeft);
    //methods.opValI('tracer',{name:'Трейсер',obj:n,value:'tracer'},opLeft);
    //methods.opValI('bullet',{name:'Снаряд',obj:n,value:'bullet'},opLeft);
    //methods.opValI('tagSelect',{name:'Тег',obj:n,value:'solidTag'},opLeft)
    methods.opValI('selectMenuObjectID',{name:'Скин',obj:n,value:'skinSelect',menu: loadAnim.skins,iname:'name'},opLeft)
    methods.opValI('name',{name:'Позиция'},opLeft);
    methods.opValI('number',{name:'По оси X',obj:n,value:'offsetX',step: 1},opLeft);
    methods.opValI('number',{name:'По оси Y',obj:n,value:'offsetY',step: 1},opLeft);
    methods.opValI('name',{name:'Размер'},opLeft);
    methods.opValI('number',{name:'По оси X',obj:n,value:'scaleX',step: 0.01,fix: 3},opLeft);
    methods.opValI('number',{name:'По оси Y',obj:n,value:'scaleY',step: 0.01,fix: 3},opLeft);
    methods.opValI('name',{name:'Слой'},opLeft);
    methods.opValI('number',{name:'Прозрачность',obj:n,value:'opacity',step: 0.01,fix:3,min:0,max:1},opLeft);
    methods.opValI('number',{name:'Вращение',obj:n,value:'rotation',step: 1},opLeft);
    methods.opValI('name',{name:'Якорь'},opLeft);
    methods.opValI('number',{name:'По оси X',obj:n,value:'anchorX',step: 0.01,fix:3,min:0,max:1},opLeft);
    methods.opValI('number',{name:'По оси Y',obj:n,value:'anchorY',step: 0.01,fix:3,min:0,max:1},opLeft);
    
    
    $.sl('update_scroll');
    
    selectAnimParentID = n.id;
}

methods.atachToTransform = function(sprite,object){
    sprite.angle = object.angle;
    sprite.spins = object.spins;
    
    transformBox.attach(sprite)
    
    transformBox.on('position',function(a,b,n){
        var parent = spritesAnim[object.parent];
        
        if(parent){
            var position = parent.getPosition();
            var relPosition = OffsetPoint(position.x,position.y,-parent.getRotation(),n.x - position.x,n.y - position.y);
            
            object.offsetX = relPosition.x - position.x;
            object.offsetY = relPosition.y - position.y;
        }
        else{
            object.offsetX = n.x - sizeCns[0]/2;
            object.offsetY = n.y - sizeCns[1]/2;
        }
        
    })
    transformBox.on('rotation',function(cursorAngle,d,gear,spins){
        if(spritesAnim[object.parent]){
            var angle = spritesAnim[object.parent].getRotation() * (180/Math.PI);
            
            object.rotation = gear - angle;
        }
        else object.rotation = gear;
        
        object.angle = sprite.angle;
        object.spins = sprite.spins;
    })
    
    transformBox.on('scale',function(s){
        object.scaleX = s.x;
        object.scaleY = s.y;
    })
}

methods.addLayer = function(i,n){
    var box = n.parent && loadAnim.layers[n.parent]  ? $('>ul',layersBox.find('li#'+n.parent)) : layersBox;
    
    var boxAdd = $([
        '<li id="'+i+'" class="'+n.type+'"><span>'+n.name+'</span><ul></ul></li>'
    ].join(''));
    
    $('span',boxAdd).on('contextmenu',function(e){
        e.preventDefault();
        
        $(this).sl('menu',{
            'Удалить':function(){
                for(var c in loadAnim.layers){
                    if(loadAnim.layers[c].parent == i){
                        delete loadAnim.layers[c];
                        methods.deleteAnimLayer(c);
                    } 
                }
                
                delete loadAnim.layers[i];
                methods.deleteAnimLayer(i);
                
                methods.initLayers();
                methods.updateVis();
                
                opLeft.empty()
                $.sl('update_scroll');
            },
            'Удалить оставить':function(){
                for(var c in loadAnim.layers){
                    if(loadAnim.layers[c].parent == i) loadAnim.layers[c].parent = false;
                }
                
                delete loadAnim.layers[i];
                methods.deleteAnimLayer(i);
                
                methods.initLayers();
                methods.updateVis();
                
                opLeft.empty()
                $.sl('update_scroll');
            }
        },{
            position: 'cursor',
            conteiner: window
        })
    }).on('click',function(){
        methods.layerOption(n)
        
        methods.atachToTransform(spritesAnim[i],n)
        
        methods.initAnimKeys();
    })
    
    boxAdd.appendTo(box)
}

methods.initLayers = function(){
    layersBox.empty();
    
    for(var i in loadAnim.layers) methods.addLayer(i,loadAnim.layers[i]);
}

methods.addNewAnim = function(){
    var id = hash('_');
    
    loadAnim.animations[id] = {
        id: id,
        name: 'Слой',
        anim: {},
        time: 3
    }
    
    methods.initAnimations(id);
}

methods.addNewSkin = function(){
    var id = hash('_');
    
    loadAnim.skins[id] = {
        id: id,
        name: 'Скин'
    }
    
    methods.initSkins(id);
}

methods.initAnimation = function(){
    
    layersBox = $('#flLayers .content').addClass('treeList animlayerListContent');
    animBox   = $('#flAnimations .content');
    skinBox   = $('#flSkins .content');
    opLeft    = $('#panel .objectProperty');
    
    $('#playAnim').on('click',function(){
        animCns.played = animCns.played ? 0 : 1;
        
        if(animCns.played) $(this).addClass('active');
        else $(this).removeClass('active');
        
    })
    
    $('#loopAnim').on('click',function(){
        animCns.loop = animCns.loop ? 0 : 1;
        
        if(animCns.loop) $(this).addClass('active');
        else $(this).removeClass('active');
        
    })
    
    $('#startAnim').on('click',function(){
        curentTime = 0;
        animCns.sliderPlay = animCns.sliderUpdate = true;
    })
    
    $('#endAnim').on('click',function(){
        if(selectAnimID){
            curentTime = selectAnimID.time;
            animCns.sliderPlay = animCns.sliderUpdate = true;
        }
    })
    
    $('#stepAnim').on('click',function(){
        animCns.stepPlay = animCns.stepPlay ? 0 : 1;
        
        if(animCns.stepPlay) $(this).addClass('active');
        else $(this).removeClass('active');
    })
    
    $('#insetKey').on('click',function(){
        if(selectAnimID && selectAnimParentID){
            var animation = selectAnimID;
            
            animation.anim = checkObject(animation.anim);
            
            if(!animation.anim[selectAnimParentID]) animation.anim[selectAnimParentID] = [];
            
            var anim  = animation.anim[selectAnimParentID];
            var layer = loadAnim.layers[selectAnimParentID];
            var find  = -1;
            
            for(var i in anim){
                if(anim[i].time == curentTime) find = i;
            }
            
            var arr = {
                time: curentTime,
                typeKey: find > 0 ? anim[find].typeKey : 'line',
                offsetX: layer.offsetX,
                offsetY: layer.offsetY,
                anchorX: layer.anchorX,
                anchorY: layer.anchorY,
                rotation: layer.rotation,
                scaleX: layer.scaleX,
                scaleY: layer.scaleY,
                visible: layer.visible,
                opacity: layer.opacity
            };
            
            if(find > 0) anim[find] = arr;
            else anim.push(arr);
            
            methods.initAnimKeys();
        }
    })
    
    
    
    $('.animTrack').on('mousemove',function(e){
        if(selectAnimID && moved){
            curentTime = selectAnimID.time / (animCns.width/e.offsetX);
            animCns.slider.setX(e.offsetX);
            animCns.sliderPlay = true;
        }
    }).on('mousedown',function(e){
        e.preventDefault();
        
        if(selectAnimID && e.offsetY < 15){
            curentTime = selectAnimID.time / (animCns.width/e.offsetX);
            animCns.slider.setX(e.offsetX);
            animCns.sliderPlay = true;
        }
        
        moved = true;
    }).on('mouseup',function(){
        moved = false;
        
        if(selectAnimParentID) setTimeout(function(){
            methods.layerOption(loadAnim.layers[selectAnimParentID])
        },20) 
    }).on('contextmenu',function(e){
        e.preventDefault();
        
        if(animCns.hoverKey){
            var copyKey = animCns.hoverKey;
            
            $(this).sl('menu',{
                'Удалить':function(){
                    removeArray(selectAnimID.anim[selectAnimParentID],copyKey);
                    methods.initAnimKeys()
                },
                'line':function(){
                    copyKey.typeKey = 'line';
                    methods.initAnimKeys()
                },
                'easeIn':function(){
                    copyKey.typeKey = 'easeIn';
                    methods.initAnimKeys()
                },
                'easeOut': function(){
                    copyKey.typeKey = 'easeOut';
                    methods.initAnimKeys()
                }
            },{
                position: 'cursor',
                conteiner: window
            })
        }
    })
    
    methods.initLayers();
    methods.initAnimations();
    methods.initSkins();
    
    layersBox.nestedSortable({
		forcePlaceholderSize: true,
		handle: 'span',
		items: 'li',
		tabSize: 0,
		maxLevels: 0,
        listType: 'ul',
		isTree: true,
        placeholder: 'placeholder',
        stop: function( event, ui ) {
            var sortArray = layersBox.nestedSortable('toArray', {startDepthCount: 0});
            var newSort   = {};
            
            for(var i in sortArray){
                var arc = sortArray[i];
                
                if(arc.depth > 0){
                    newSort[arc.item_id]        = loadAnim.layers[arc.item_id];
                    newSort[arc.item_id].parent = arc.parent_id;
                }
            }
            
            loadAnim.layers = newSort;
            methods.updateVis();
        }
	});
    
    methods.addTreker();
    
    layersGroup = new Kinetic.Group();
    rootsGroup  = new Kinetic.Group();
    
    graphicsLayer.add(layersGroup);
    graphicsLayer.add(rootsGroup);
    
    methods.updateVis();
    
    methods.animLayer()
}

methods.updateTraker = function(){
    animCns.width = $('#animTrack').width();
    
    graphicsStage.setWidth(animCns.width);
}

methods.addTreker = function(){
    /** Трекер **/
    animCns.width = $('#animTrack').width();
    
    animCns.cns   = new Kinetic.Stage({
        container: 'animTrack',
        width: animCns.width,
        height: 42
    });
    
    animCns.layer = new Kinetic.Layer();
    
    animCns.slider = new Kinetic.Rect({
        width: 2,
        height: 40,
        fill: '#ff5400',
        offset: [1,0]
    })
    
    animCns.key = new Kinetic.Rect({
        width: 8,
        height: 8,
        fill: '#ff5400',
        draggable: true,
        rotation: (Math.PI/2)/2,
        stroke: '#1e1e1e',
        strokeWidth: 1,
        offset: [4.5,4.5]
    })
    
    animCns.keyCircle = new Kinetic.Circle({
        radius: 4,
        fill: '#ff5400',
        draggable: true,
        stroke: '#1e1e1e',
        strokeWidth: 1,
        offset: [0.5,0.5]
    })
    
    animCns.groupKeys = new Kinetic.Group({
        y: 25
    })
    
    animCns.layer.add(animCns.slider)
    animCns.layer.add(animCns.groupKeys)
    animCns.cns.add(animCns.layer);
}