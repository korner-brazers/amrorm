methods.init = function(){
    
    /**
     * ContextMenu
     */
    
    $('#buld').on('mousedown',function(e){
        if( e.button == 2 ) {
            
        } 
    }).on('contextmenu',function(){
        return false;
    });
    
    /**
     * Init Scroll Size
     */
    
    var jsThis = $(visual_bg).get(0);
    
    if (jsThis.addEventListener){
        jsThis.addEventListener('DOMMouseScroll', methods.scroll, false);
        jsThis.addEventListener('mousewheel', methods.scroll, false);
    }
    else if (jsThis.attachEvent) {
        jsThis.attachEvent('onmousewheel', methods.scroll);
    }
    
    /**
     * Drag objs and background
     */
    
    var ctrlDown = false;
    var ctrlKey  = 17, vKey = 86, cKey = 67;
    
    $(document).on('keydown',function(e){
        var tag = e.target.tagName.toLowerCase();
        
        if(tag == 'input' || tag == 'textarea') return;
        
        if(e.keyCode == 32){
            e.preventDefault();
            $(visual_bg).css({cursor:'move'})
            dragBg[8] = true;
        }
        
        if(e.keyCode == 9){
            e.preventDefault();
            methods.panelShowOrHide();
        }
        
        if (e.keyCode == ctrlKey) ctrlDown = true;
        
        if(ctrlKey && e.keyCode == 83){
            e.preventDefault();
            methods.fileSaveAnim()
        }
        if(ctrlKey && e.keyCode == 78){
            e.preventDefault();
            methods.fileNewAnim()
        }
        if(ctrlKey && e.keyCode == 79){
            e.preventDefault();
            methods.fileOpenAnim()
        }
    }).on('keyup',function(e){
        var tag = e.target.tagName.toLowerCase();
        
        if(tag == 'input' || tag == 'textarea') return;
        
        if(e.keyCode == 32){
            $(visual_bg).css({cursor:'default'})
            dragBg[8] = false;
        }
        
        if (e.keyCode == ctrlKey) ctrlDown = false;
    })
    
    $(visual_bg).on('mousedown',function(e){
        if(dragBg[8]){
            dragBg[0]    = true;
            dragBg[1]    = e.pageX/ui.scale; 
            dragBg[2]    = e.pageY/ui.scale;
            dragBg[5]    = graphicsStage.getOffset().x;
            dragBg[6]    = graphicsStage.getOffset().y;
        }
    }).on('mousemove',function(e){
        
        if(!dragBg[0]) return;
        
        dragBg[3] = dragBg[1] - e.pageX/ui.scale;
        dragBg[4] = dragBg[2] - e.pageY/ui.scale;
        
        var x = Math.round(dragBg[5] + dragBg[3]),
            y = Math.round(dragBg[6] + dragBg[4]);
            
        
        if(Math.abs(dragBg[3]) > 1 || Math.abs(dragBg[4]) > 1) dragElem = true;
        
        dragBg[9] = true;
        
        ui.origin.x = x;
        ui.origin.y = y;
    
        graphicsStage.setOffset(x,y)
        graphicsStage.draw();
        
    }).on('mouseup',function(){
        dragBg[0] = false;
    }).on('keydown',function(e){
        //if(ctrlDown && e.keyCode == vKey) methods.cloneObject();
    }).on('contextmenu',function(){
        transformBox.detach();
    });
    
    /**
     * Cursor move body
     */
     
    $('#buld').on('mousemove',function(e){
        buld_cur = [e.pageX,e.pageY];
    });
    
    $.sl('resize',['.buld_bottom','.top_panel'],'.resizeWin',function(h,ah){
        sizeCns = WHElem();
        
        $('.rightToolBox').height(sizeCns[1]-11); //11 высота сепаратора
        
        graphicsStage.setHeight(sizeCns[1]);
        graphicsStage.setWidth(sizeCns[0]);
        
        if(dataCache.lineX) dataCache.lineX.setPoints([sizeCns[0]/2-200,sizeCns[1]/2,sizeCns[0]/2+200,sizeCns[1]/2])
        if(dataCache.lineY) dataCache.lineY.setPoints([sizeCns[0]/2,sizeCns[1]/2-100,sizeCns[0]/2,sizeCns[1]/2+100])
        if(dataCache.circle) dataCache.circle.setPosition(sizeCns[0]/2,sizeCns[1]/2)
    })
    
    ofvisual = $(visual_bg).offset();
    
    transformBox = new methods.transformTool({
        layer: graphicsLayer,
        visual: true
    })
    
    methods.centerLines();
    
    $('.preloader').fadeOut();
    
    methods.flUpdate();
    
    methods.initAnimation();
    
    methods.panelShowOrHide()
}

methods.centerLines = function(){
    dataCache.lineX = new Kinetic.Line({
        points: [sizeCns[0]/2-200,sizeCns[1]/2,sizeCns[0]/2+200,sizeCns[1]/2],
        stroke: '#1d1d1d',
        strokeWidth: 1,
    })
    
    dataCache.lineY = new Kinetic.Line({
        points: [sizeCns[0]/2,sizeCns[1]/2-100,sizeCns[0]/2,sizeCns[1]/2+100],
        stroke: '#1d1d1d',
        strokeWidth: 1,
    })
    
    dataCache.circle = new Kinetic.Circle({
        x: sizeCns[0]/2,
        y: sizeCns[1]/2,
        radius: 3,
        fill: '#1d1d1d',
    })
    
    graphicsLayer.add(dataCache.lineX)
    graphicsLayer.add(dataCache.lineY)
    graphicsLayer.add(dataCache.circle)
}

/**
 * Дополнительные функции
 */
methods.info = function(i){
    buld_info.text(i);
    methods.prjChange();
}

methods.prjChange = function(s){
    s ? $('.visual_bg_conteiner').removeClass('change') : $('.visual_bg_conteiner').addClass('change');
}
methods.cor = function(){
    var x = buld_cur[0] - ofvisual.left,
        y = buld_cur[1] - ofvisual.top;
        
    return {x:x,y:y};
}
methods.panelShowOrHide = function(show){
    $('#panel').toggleClass('active');
}

methods.getStageCursor = function(){
    var cor = methods.cor();
    
    return {
        x: Math.round(cor.x - graphicsStage.getX()) / ui.scale + graphicsStage.getOffset().x,
        y: Math.round(cor.y - graphicsStage.getY()) / ui.scale + graphicsStage.getOffset().y
    };
}

methods.scroll = function(evt,iDelta){
    if(evt) evt.preventDefault();
   
    if(!iDelta){
        var evt = evt || window.event;
        var iDelta = evt.wheelDelta ? evt.wheelDelta/120 : -evt.detail/3;
    }
    
    var cor = methods.cor();
    var mx = cor.x,
        my = cor.y,
        wheel = iDelta / 120;
        
    var zoom = (ui.zoomFactor - (iDelta < 0 ? 0.2 : 0));
    var newscale = ui.scale * zoom;
    
    ui.origin.x = Math.round(mx / ui.scale + ui.origin.x - mx / newscale);
    ui.origin.y = Math.round(my / ui.scale + ui.origin.y - my / newscale);
    
    graphicsStage.setOffset(ui.origin.x, ui.origin.y);
    graphicsStage.setScale(newscale);
    graphicsStage.draw();
    
    ui.scale *= zoom;
    
    methods.info(Math.round(ui.scale*100)+'%');
}

methods.abount = function(){
    var html = [
        '<div class="t_center">',
        '<img src="editor/media/img/abount.png" />',
        '</div>',
        '<div class="t_p_10" style="padding-left: 52px">',
        '<p>AMRORM - Программа для 2D скелетной анимации</p>',
        'Автор: <a href="http://vk.com/korner_brazers">korner brazers</a><br />',
        'Сайт: <a href="http://amrorm.com">amrorm.com</a>',
        '</div>'].join('');
        
    $.sl('window',{data:html,w:400,h:240});
}

methods.setScale = function(sc){
    if(!sc){
        graphicsStage.setScale(1);
        ui.scale = 1;
        methods.info('100%');
    } 
    else methods.scroll(null,sc);
}

methods.count = function(a){
    var c = 0;
    for(var i in a) c++;
    return c;
}

methods.checkAnimObject = function(){
    loadAnim            = checkObject(loadAnim);
    loadAnim.layers     = checkObject(loadAnim.layers);
    loadAnim.animations = checkObject(loadAnim.animations);
    loadAnim.skins      = checkObject(loadAnim.skins);
    
    if(!loadAnim.layers)     loadAnim.layers     = {};
    if(!loadAnim.animations) loadAnim.animations = {};
    if(!loadAnim.skins)      loadAnim.skins      = {};
}

methods.updateAnimationAll = function(){
    selectAnimID = selectAnimParentID = null;
    methods.updateVis();
    methods.initLayers();
    methods.initAnimations();
    methods.initSkins();
    methods.initAnimKeys();
}

methods.newFileComplite = function(){
    loadAnim.layers     = {};
    loadAnim.animations = {};
    loadAnim.skins      = {};

    methods.updateAnimationAll();
}

methods.fileNewAnim = function(){
    if(app){
        LZADialog.saveFileAs({filename:'animation.js'}, function(file){
            opendFile = file.path;
            
            methods.newFileComplite();
            
            methods.fileSaveAnim();
        });
    }
    else{
        $.sl('_promt',{
            w: 400,
            h: 60,
            btn: {
                'Сохранить':function(wn,form,result){
                    opendFile = form[0].value;
                    
                    methods.newFileComplite();
                    
                    methods.fileSaveAnim();
                }
            },
            input: ['name']
        })
    }
}

methods.readFileAnim = function(str){
    try{
        loadAnim = JSON.parse(str);
        methods.checkAnimObject();
        
        methods.updateAnimationAll();
    }
    catch(e){
        $.sl('info','Не удалось открыть файл!');
    }
}
methods.fileOpenAnim = function(){
    if(app){
        LZADialog.selectFile(function(file){
            opendFile = file.path;
            methods.readFileAnim(ediManager.openFilePath(file.path));
        });
    }
    else{
        methods.selectImg('',function(file){
            opendFile = file;
            
            $.sl('load','edi.php?a=readfile',{data:{file:file}},function(str){
                methods.readFileAnim(str);
            })
        })
    }
}

methods.fileSaveAnim = function(){
    if(opendFile){
        if(app) ediManager.saveFilePath(opendFile,JSON.stringify(loadAnim));
        else{
            $.sl('load','edi.php?a=savefile',{data:{file:opendFile,data:JSON.stringify(loadAnim)}});
        }
    } 
}

/* Трансформация обьекта */

methods.transformTool = function(a){
    var attached  = null;
    var dragstart = false;
    var call      = {};
    
    var transform = {
        on: function(method,func){
            call[method] = func;
        },
        attach: function(object){
            group.show();
            group.setZIndex(100);
            attached = object;
        },
        detach: function(){
            group.hide();
            call = {};
            attached = false;
        },
        update: function(){
            if(attached){
                group.setPosition(attached.getPosition());
                group.setRotation(attached.getRotation());
            }
        }
    }
    
    var group     = new Kinetic.Group({
        visible: 0
    });
    
    var grad = new Kinetic.Circle({
        radius: 20,
        stroke: '#ff5400',
        strokeWidth: 2,
        draggable: true,
    });
    
    grad.on('dragstart', function() {
        dragstart = true;
    });
    grad.on('dragmove', function(){
        
        var pos = grad.getAbsolutePosition();
        var uio = {
            x: Math.round(pos.x - graphicsStage.getX()) / ui.scale + graphicsStage.getOffset().x,
            y: Math.round(pos.y - graphicsStage.getY()) / ui.scale + graphicsStage.getOffset().y
        };
    
        call.position && call.position(pos,grad.getPosition(),uio);
        grad.setPosition(0,0);
        
        a.visual && transform.update()
    });
    grad.on('dragend', function() {
        dragstart = false;
    });
    
    var scaleX = new Kinetic.Rect({
        x: 40,
        width: 10,
        height: 10,
        offset: [5,5],
        stroke: '#ff5400',
        strokeWidth: 1,
        draggable: true,
    })
    
    var scaleY = scaleX.clone();
        scaleY.setX(0);
        scaleY.setY(-40);
        
    var rotate = new Kinetic.Circle({
        x: 100,
        y: 0,
        radius: 6,
        stroke: '#ff5400',
        strokeWidth: 1,
        draggable: true,
    });
        
    var lineX = new Kinetic.Line({
        points: [0, 0, 35, 0],
        stroke: '#ff5400',
        strokeWidth: 1,
    });
    
    var lineY = lineX.clone();
        lineY.setPoints([0,0,0,-35]);
        
    var lineR = lineX.clone();
        lineR.setPoints([0,0,100,0]);
    
    var scope = this;
    
    rotate.on('dragmove',function(){
        /* Куда врашаем */
        var positionGroup  = group.getPosition();
        var rotatePosition = a.visual ? methods.getStageCursor() : rotate.getAbsolutePosition();
        var rotationOrig   = ToAngle(positionGroup.x,positionGroup.y,rotatePosition.x,rotatePosition.y);
        var rotation       = rotationOrig;
        
        var angle = attached.angle || 0;
        var spins = attached.spins || 0;
        
        if(To360(angle)>270 && To360(rotation)<90) spins++;
        if(To360(angle)<90 && To360(rotation)>270) spins--;
        
        /* Переписываем на новый курс */
        angle = rotation;
        
        /* Пишем количество оборотов */
        attached.spins = spins;
        attached.angle = angle;
        
        /* Ну и на сколько развернуть */
        var gers    = To360(angle)+spins*360;
        var degrees = To360(rotation);
        
        call.rotation && call.rotation(rotation,degrees,gers,spins);
        rotate.setPosition({x: 100,y:0});
        
        a.visual && transform.update()
    })
    
    scaleX.on('dragmove',function(){
        var atachScale    = attached.getScale();
        var position = scaleX.getPosition();
        
        var scX = atachScale.x + (atachScale.x*((position.x - 40)*0.001));
        call.scale && call.scale({x:scX,y:atachScale.y});
        
        scaleX.setPosition(40,0);
        
        a.visual && transform.update()
    })
    
    scaleY.on('dragmove',function(){
        var atachScale    = attached.getScale();
        var position = scaleY.getPosition();
        
        var scY = atachScale.y - (atachScale.y*((position.y + 40)*0.001));
        call.scale && call.scale({x:atachScale.x,y:scY});
        
        scaleY.setPosition(0,-40);
        
        a.visual && transform.update()
    })
    
    group.add(lineX);
    group.add(lineY);
    group.add(lineR);
    group.add(scaleY);
    group.add(scaleX);
    group.add(rotate);
    group.add(grad);
    a.layer.add(group)
    
    
    return transform;
}