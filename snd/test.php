<?
for($i=1; $i<=20; $i++){
//    passthru("espeak $i -w $i.wav");
    passthru("sox $i.wav $i.ogg");
}
?>
