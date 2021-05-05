<?php
$test = "ÄÄÄÄÄÄÄÄÄÄÖÖÖÖÖÖÖÖ";

print(replaceUmlaut($test));

function replaceUmlaut($string){
    if (strpos("Ä", $string) === false ||
        strpos("Ö", $string) === false ||
        strpos("Ü", $string) === false ||
        strpos("ä", $string) === false ||
        strpos("ö", $string) === false ||
        strpos("ü", $string) === false)
    {
    $string = str_replace("Ä", "AE", $string);
    $string = str_replace("Ö", "OE", $string);
    $string = str_replace("Ü", "UE", $string);

    $string = str_replace("ä", "ae", $string);
    $string = str_replace("ö", "oe", $string);
    $string = str_replace("ü", "ue", $string);
    }

    return $string;
}

function replaceInch($string){
    if (strpos("½", $string) === false ||
        strpos("¼", $string) === false ||
        strpos("¾", $string) === false ||
        strpos("⅛", $string) === false)
    {
        $string = str_replace("½", "+1_2+", $string);
        $string = str_replace("¼", "+1_4+", $string);
        $string = str_replace("¾", "+3_4+", $string);
        $string = str_replace("⅛", "+1_8+", $string);
    }
    return $string;
}

