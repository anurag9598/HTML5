<?php

class GoToBrickDto extends BaseBrickDto {

    public $destinationType; //mouseTouchPointer, random, sprite
    public $spriteId;

    public function __construct($destinationType, $spriteId = null, $commentedOut = false) {
        parent::__construct("GoTo", $commentedOut);

        $this->destinationType = $destinationType;
        $this->spriteId = $spriteId;
    }
}
