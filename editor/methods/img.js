/*Выбор изображений*/

methods.selectImg = function(i,fn){
    if(app){
        LZADialog.selectFile(function(file){
            fn(file.path);
        });
        /*
        ediManager.readFolder(LastSelectIF,function(files){
            methods.readFolder(i,fn,files);
    	})
        */
    }
    else{
        $.sl('load','edi.php?a=readfolder',{data:{i:i},dataType:'JSON'},function(files){
            methods.readFolder(i,fn,files)
        })
    }
}
methods.readFolder = function(i,fn,files){
    function removeSP(str){
        if(app) return nwDir+str;
        else return str;
    }
    
    var j = [];
    
    if(LastSelectIF !== ''){
        var ex = LastSelectIF.split('/');
            ex.pop();
              
        j.push(['back',ex.join('/')]);
    }
    
    for(var i in files.dir) j.push(['dir',LastSelectIF+'/'+files.dir[i]])
    
    for(var i in files.file){
        var name = files.file[i];
        
        var ex = name.split('.');
            ex.pop();
        
        var nam = ex.join('.');
    
        j.push(['file',LastSelectIF+'/'+name,nam,name]);
    } 
    
    
	var li = '';
	
	$.each(j,function(o,s){
		var sp = s[1].split('/');
		
		li += '<li title="'+s[1]+'" class="'+s[0]+'"><img class="ld" /><div class="inf"><span>'+sp[sp.length-1]+'</span></div></li>';
	})
	
	$.sl('window',{title:'Файлы',status: 'data',bg:0,drag:1,size:1,preload: 0,name:'selImg',data:'<ul class="imgSelect t_ul">'+li+'</ul>',w:700,h:500},function(wn){
	    
	    if(wn == 'close') return;
        
		$.each(j,function(o,s){
			var img = $('.imgSelect li:eq('+o+')');
			
            if(s[0] == 'file'){
				img.on('click',function(){
				    if(selectObjWork) return selectObjWork(s[1],s[1],true,'image');
                    else{
                        fn && fn(s[1],s[2]);
					    $.sl('window',{name:'selImg',status:'close'});
                    }
				});
				
				var imageObj = new Image();
					imageObj.onload = function(){
					    img.removeClass('file')
						$('img',img).attr({src:removeSP(s[1])}).removeClass('ld').css({
							marginTop: imageObj.height > 110 ? 0 : 110 / 2 - (imageObj.height / 2)
						})
					};
					imageObj.src = removeSP(s[1]);
            }
            else{
                img.on('click',function(){
                    LastSelectIF = s[1];
                    methods.selectImg(s[1],fn);
                })
            }
		})
	})
}