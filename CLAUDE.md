## Overview

This is code to implement a game called Tactile. Rules to this game can be found at https://s3.amazonaws.com/geekdo-files.com/bgg421915?response-content-disposition=inline%3B%20filename%3D%22Rulebook_final_nobleed_overdrive.pdf%22&response-content-type=application%2Fpdf&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJYFNCT7FKCE4O6TA%2F20260224%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260224T013550Z&X-Amz-SignedHeaders=host&X-Amz-Expires=120&X-Amz-Signature=06c1574b479e06b0c4241f8737802a7aeea03be8f6cc98ee118b5d41b96862a0

## Architecture

The code is written in PHP and Javascript. It accesses a proprietary code library that cannot be seen! When the code runs on the server, it calls this framework. This is true both of the javascript library and the php library.

## Refrences
Framework docs: https://en.doc.boardgamearena.com/Studio_file_reference
	- follow links to get more information.
	
Examples of codebases written for this framework. These can provide examples:
	- https://github.com/elaskavaia/bga-heartsla
	- https://github.com/AntonioSoler/bga-santorini
	- https://github.com/bga-devs/tisaac-boilerplate/ - not a game, but some helper functions a dev created.


## Objective 

In this sprint, we are going to make a few basic changes:
- rename Overdrive to Convert. Associated variable names should also change. 
- you can't use basic actions as part of a CONVERT (so just limit it to cards) - very few people realize you can use basic actions so this will help level the playing field
- remove 3P game modes (its an inconsistent experience with the others, i don't want this to be someone's only TacTile experience) 