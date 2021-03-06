<?php

class SpriteDto {

    public $id;		//used for e.g. SetDirectionToBrick
    public $name;
    public $scripts = array();	//scripts
    public $userScripts = array();	//user defined scripts

    public $looks = array();	//of type LookDto : ResourceReferenceDto
    public $sounds = array();	//of type ResourceReferenceDto
    public $variables = array();
    public $lists = array();
    public $nfcTags = array();

    public function __construct($id, $name) {
        $this->id = $id;
        $this->name = $name;
    }

}
