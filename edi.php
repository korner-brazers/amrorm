<?
define('DIR',dirname(__FILE__));

$a = $_GET['a'];

class edi{
    function __call($n,$m){
        
    }
    
    function scan($dir,$p = false){
        if(is_dir($dir)){
            $handle = @opendir( $dir );
            
        	while ( false !== ($file = @readdir( $handle )) ) {
                
        		if( @is_dir( $dir.'/'.$file ) and ($file != "." and $file != "..") ) {
        			  
                    $c_files['dir'][$file] = $p ? $dir : $file;
        			
        		}elseif($file != "." and $file != ".."){
        		    $c_files['file'][$file] = $p ? $dir : $file;
        		}
        	}
           @closedir($handle);
       }
       
       if(count($c_files['dir']) == 0)  $c_files['dir']  = array();
       if(count($c_files['file']) == 0) $c_files['file'] = array();
       
       return $c_files;
    }
    
    function readfolder(){
        $i = $_POST['i'];
        
        $scan = $this->scan(DIR.'/'.$i);
        
        return json_encode($scan);
    }
    function readfile(){
        return file_get_contents(DIR.'/'.$_POST['file']);
    }
    
    function savefile(){
        file_put_contents(DIR.'/'.$_POST['file'],$_POST['data']);
    }
}

$edi = new edi();

echo $edi->$a();
?>