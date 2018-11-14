import json
import boto3
import os
from pathlib import Path
from pymongo import MongoClient

S3_BUCKET = os.environ.get('SSS_BUCKET')
MONGO_URI = os.environ.get('MONGO_URI')

def save_locally(key, data): 
    return _save_locally('server/data/', key, data)

# Saves the file; returns False if this works 
def _save_locally(path, key, data): 
    base_filename = path + str(key) 
    filename = base_filename
    data_file = Path(filename + '.json')
    counter = 1
    while data_file.exists(): 
        # we are about to overwrite a file... 
        filename = base_filename + '_' + str(counter) + '.json'
        data_file = Path(filename)
        counter+=1
    with data_file.open('w') as f: 
        json.dump(data, f)
    return filename

def save_s3(key, data): 
    if not S3_BUCKET:
        raise RuntimeError("No S3 bucket supplied to put data in!") 
    else: 
        print("Sending to s3 bucket %s" % S3_BUCKET)
    s3 = boto3.resource('s3')
    bytestring = json.dumps(data).encode()
    r = s3.Object(S3_BUCKET, key).put(Body=bytestring, ContentType='application/json')
    print(r)
    return

def save_mongo(key, data): 
    print("Saving to mongo")
    # mongodb keeps track of ids like this
    if not MONGO_URI: 
        raise RuntimeError("No MongoDB URI supplied to store data!")
    data["key"] = key
    client = MongoClient(MONGO_URI)
    db = client.get_default_database()
    collection = db['data']
    collection.insert_one(data)
    client.close()
