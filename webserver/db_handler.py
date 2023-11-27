import sqlite3, os, hashlib

#users = {"gmail": {'password': 'secret'}}

con = sqlite3.connect("webserver/users.db")

cur = con.cursor()

#cur.execute("CREATE TABLE Users(Username, email, password)")

class db_handler():
    password = input()
    salt = os.urandom(32)
    hash_object = hashlib.sha256()
    hash_object.update(salt + password.encode())
    hash_password = hash_object.hexdigest()
    print(hash_password)


#res = cur.execute("SELECT name FROM sqlite_master")
#res.fetchone()