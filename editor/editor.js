var buld_info    = $('#infoRm'),
    buld_cur     = [0,0],
    dragBg       = [false,0,0,0,0,0,0],
    dragElem     = false,
    visual_bg    = '#buld .visual_bg_conteiner',
    ofvisual     = {},
    workScene    = true,
    layers       = {
        'newElement':$('#newElement'),
        'graphics':$('#graphics')
    },
    ui = {
        scale: 1,
        zoomFactor: 1.1,
        origin: {
            x: 0,
            y: 0
        }
    },
    graphicsGroup = null,
    LastSelectIF  = '',
    layersGroup   = {},
    selectObjWork = false,
    activeLayer   = false,
    opendFile     = '',
    loadAnim      = {
        layers: {},
        animations: {},
        skins: {}
    };


function WHElem(el){
    var cns = el ? $(el).show() : $(visual_bg),
        w   = cns.width(),
        h   = cns.height();
    return [w,h];
}

var sizeCns = WHElem();

/**
 * Layers Canvas
 */


var transformBox;

var graphicsStage = new Kinetic.Stage({container: 'graphics'}); 
var graphicsLayer = new Kinetic.Layer();

graphicsStage.add(graphicsLayer);

var methods = {};