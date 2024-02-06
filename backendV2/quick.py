from flask import Flask
import psycopg, asyncio
import datetime
app = Flask(__name__)

@app.route('/')
async def hello_world():
    async with await psycopg.AsyncConnection.connect(database="db",user="user",password="pass",host="127.0.0.1",port=5432, autocommit=True) as aconn:
        async with aconn.cursor() as cur:
            updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
            print("Updated at:", updated_at)
            await cur.execute("INSERT INTO prompts (id, updated_at, type, title, content, user_id, course_id) VALUES (%s, %s, %s, %s, %s, %s, %s);", (str(uuid4()), updated_at, "SUMMARY", f"Summary {updated_at}", json.dumps({"text":summary}), user_id, course_id))
    return 'Hello, World!'

app.run(debug=True,host="localhost", port=3030, threaded=True)
