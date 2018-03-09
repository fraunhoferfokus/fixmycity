[FixMyCity](http://www.fixmycity.de)
===================================

This is the core project of the FixMyCity Platform. It consists of the following components:

* Backend including Server, REST APIs, Database, etc.
* Admin Console (same as you can see here https://fixmycity.sonsofpiracy.org/admin/)
* Mobile Web App (same as you can see here https://fixmycity.sonsofpiracy.org/fmc-mob/)
	* Please note that the Mobile Web App is also available as Cordova (https://cordova.apache.org/) Application for Android, iOS and Windows Phone. Most of the code of the Mobile Web App is reused in the Cordova App. The Cordova App loads its UI from the backend. The Cordova App and the Mobile Web App provide the same features. The only difference is that the Cordova App can be deployed to the App Store, Play Store, etc. and installed as native App on Android, iOS and Windows Phone. The Access to the camera to take picture is handled in a different way as in the Mobile Web App.

	> Cordova projects for all other platforms will be published soon


Requirements
==========

* Linux Environment (tested with Linux Ubuntu 15.04 and older versions)
* `apt-get` to install new packages

Setup
=====

 * Install Git and clone this project 
   >  $ sudo apt-get install git  
   >  $ git clone https://github.com/PiratePartyGR/fixmycity.git
   >  rename the folder fixmycity-web to fixmycity

 * Install Python 2.7 (should be already installed on the latest Ubuntu versions, you can skip this step)
   >  $ sudo apt-get install python
   
 * Install Python-Pip
   >  $ sudo apt-get install python-pip
 
 * Install Mercurial
   >  $ sudo apt-get install mercurial
   
 * Install gitk
   >  $ sudo apt-get install gitk

 * Other requirements listed in [requirements.txt](requirements.txt) will automatically installed
  
Run
====

**Virtual environment**:

 * It's recommended to run django in a virtual environment.  
   >  $ sudo apt-get install python-virtualenv
   
 * create a folder for your environments and go to this folder in the command prompt  
   >  $ mkdir environments
   >  $ cd environments
   >  $ virtualenv django1.3  
   >  $ source django1.3/bin/activate  
   
 * you should see (django1.3) at your prompt like *(django1.3)$*.  
 * type *deactivate* to leave the environment  
  
  
**Fixmycity**:
   
 * To run the testserver you need to install the requirements (only needed for first install).
   >  (django1.3)$ sudo pip install -r requirements.txt

 * To use the static files with the testserver, you have to set the Debug variable to "true" in settings.py.
   * It is not recommended to use *debug = true* in production.
   * In production mode you need to host the static files through another server e.g. Apache. Please refer to the [Django 1.3.3 Documentation, section 4.16](https://media.readthedocs.org/pdf/django/1.3.X/django.pdf) for more details.  
 * Generate the database  
   > sudo pip install celery==3.1.17
   > sudo apt-get install python-pil
   > sudo pip install celery==3.1.17
   > (django1.3)$ sudo python manage.py syncdb  
   
 * Run the testserver  
   >  (django1.3)$ sudo python manage.py runserver 8080  
 * the number is the port and can be freely chosen.  
 * Create superuser (you can run at any time if you forgot superuser name/pass): use this to login to the admin console
   > (django1.3)$ python manage.py createsuperuser
   
Test
=====
**Admin console**:
 * Open admin console using http://localhost:8080/admin
 * Log into the admin site with your superuser data (you can create a new superuser, if you have forgot your data)
 * Under "User Administration" select *Users*
 * You should see a list with all users. Click on the username you want to activate.
 * Under "Permissions" check *Active*
 * Click on Save
 
**FixMyCity Mobile App**:
 * Open Mobile App using http://localhost:8080/ (tested in chrome on desktop and mobile)
 * Note: use another browser as for the admin console or logout from the admin console if you are already logged in
 * Sign up a new user
 * Follow the steps described in the admin console to activate the new user
 * Login after user is activated
 * Select "New Entry"
 * Fill the form in the page and click on *Create*
 * Once the report is created you will be automatically forwarded to the report page. You can add comments and ratings and see the status of the report in this page.
 * From the homepage you can also browse reports in the archive.
 
Disclaimer
==========
The Software is provided as is without any warranty. Contact us at <info@pirateparty.gr> in case of any questions or comments. Please read [LICENSE file](LICENSE) before using the Software.
Please contact us if you like to contribute to the project.

License
=======

see [LICENSE file](LICENSE)

```
/*******************************************************************************
 *
 * Copyright (c) 2015 Fraunhofer FOKUS, All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>.
 *
 ******************************************************************************/`
 ```
