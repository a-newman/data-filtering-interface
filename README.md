# Data cleaning interface

A simple interface for cleaning/filtering out data (particularly videos). 

## Organization 

- `index.html` contains the html page that will be displayed when you visit the app 
- `script.js` contains the JavaScript that will be loaded onto this html page
-  The directory `server` contains the files that will be used to serve this code
  - `server.py` runs the server
  - `save_data.py` contains helper functions for saving data 

## Detailed instructions for getting started with Heroku

1. (optional) Try out the server locally. This will help you understand what's going on and make sure everything is working. 
  - Set up a new [virtualenv](https://packaging.python.org/guides/installing-using-pip-and-virtualenv/) or [conda environment](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html). Install the dependencies from `requirements.txt`. 
  - Run the server by running `python3 server/server.py` and go to the following url to see the front-end: `localhost:8000`
  - If you want to test saving some data locally, you can change the variable `SAVE_METHOD` in the file `server/server.py` to `SaveMethod.LOCAL`. This will save your responses to the folder `server/data`. Try submitting something and check that it was saved in the correct format. 
2. Now let's put the app on the internet. We'll use Heroku because it's free and easy-to-use. Create a free Heroku account: https://www.heroku.com/
3. Create a Heroku app and push this code to it. ([Check out these instructions.](https://devcenter.heroku.com/articles/git#creating-a-heroku-remote)
4. In order to store data from your Heroku app, you'll need to setup a proper database instead of just the filesystem (Heroku automatically deletes files from the filesystem after a certain period). Make an account on [mLab](https://mlab.com/), which provides a MongoDB database with some amount of free storage in the cloud. Create a database with a collection called `data`. 
5. In order for your app to use your mLab database, make the variable `SAVE_METHOD` in `server/server.py` is set to `SaveMethod.MONGO` (should be set to this by default). You will also have to set an environment variable named `MONGO_URI` which you can use to access your database. See the function `save_mongo` in `server/save_data.py` to see how this is used. For more help setting up your database properly, see the [mLab documentation on connecting](https://docs.mlab.com/connecting/) and the [pymongo documentation](https://api.mongodb.com/python/current/). You will also need to [set an environment variable in Heroku](https://devcenter.heroku.com/articles/config-vars). 
6. Test your app on Heroku and make sure that when you submit a new piece of data, you can see it in your mLab database. 
