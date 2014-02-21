methods.flUpdate = function(){
    var box = $('#fileManager').empty();
    
    var listName = {
        'Layers':{
            name: 'Слои',
            addNew: function(){
                methods.addNewLayer();
            }
        },
        'Animations':{
            name: 'Анимации',
            addNew: function(){
                methods.addNewAnim();
            }
        },
        'Skins':{
            name: 'Скины',
            addNew: function(){
                methods.addNewSkin();
            }
        }
    }
    
    $.each(listName,function(i,a){
        var item = $([
            '<div class="box" id="fl'+i+'">',
                '<div class="name">'+a.name+'</div>',
                '<ul class="t_ul content"></ul>',
            '</div>',
        ].join('')).appendTo(box);
        
        if(a.addNew){
            $('<div class="addNew"></div>').appendTo($('.name',item)).on('click',function(){
                a.addNew();
            })
        }
        
        a.ready && a.ready();
    })
    
    $.sl('update_scroll');
}

methods.flAddBox = function(a){
    var box = $('<li class="'+a.type+'" id="'+a.id+'"><div class="nameItem">'+a.name+'</div></li>').appendTo(a.content);
    
    $('.nameItem',box).on('click',function(){
        if(selectObjWork) return selectObjWork(a.id,a.name,true,a.type);
        else if(a.edit) a.edit();
    })
    
    if(a.del){
        $('<del></del>').prependTo(box).on('click',function(){
            var score = $(this).parent();
            
            a.del(function(){
                score.remove();
                $.sl('update_scroll');
            })
        })
    }
}

methods.flSetActive = function(id){
    $('#fileManager li').removeClass('active');
    $('#fileManager li#'+id).addClass('active');
}