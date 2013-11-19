Envirofi-BIO
============

legacy code : ENVIROFI WP1 pilot application "Envirofi-BIO"

Please read documentation "Mobile Prototype Development.pdf" for a detailed description 
how to set up the development environment for Envirofi-BIO and how to build the app and 
to launch it on a mobile device.

Build:
1. Build mobile couchbase:
	ant -f couchbase.xml (Path: Envirofi-BIO\couchbase.xml)
2. Build app
	a. Goto directory Envirofi-BIO\assets\www
	b. ant clean sencha <lang_en OR lang_de OR lang_it>

