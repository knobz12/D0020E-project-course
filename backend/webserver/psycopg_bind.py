import psycopg
import asyncio
import datetime
from uuid import uuid4
import json

def id():
    return str(uuid4())

class LlamaDbFetcher():
    def __init__(self, user:str, password:str, database:str):
        self.conn = psycopg.AsyncConnection.connect(user=user,password=password,dbname=database,host="localhost",port=5432)

    async def FetchCoursId(self, name):
        async with await self.conn as aconn:
            async with aconn.cursor() as cur:
                await cur.execute("SELECT id FROM courses WHERE name=%s",(name,))
                courses = await cur.fetchall()
                course_id = str(courses[0][0])
                return course_id
    
    async def InsertPrompt(self, content:str, user_id:str, course_id:str, typography:str, unique_id=id):
        async with await self.conn as aconn:
            async with aconn.cursor() as cur:
                prompt_id = unique_id()
                updated_at = datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
                print("Updated at:", updated_at)
                title = f"{typography[0].upper() + typography[1:].lower()} {updated_at}"
                print(title)
                if typography == "SUMMARY":
                    content = json.dumps({"text":content})
                
                await cur.execute("INSERT INTO prompts (id, updated_at, type, title, content, user_id, course_id) VALUES (%s, %s, %s, %s, %s, %s, %s);", (prompt_id, updated_at, typography, title, content, user_id, course_id))
                await aconn.commit()

#Use:
#Iniate LlamaDbFetcher("user", "pass", "db")
#Run with asyncio:
#asyncio.run(fe.InsertPrompt("testbblalblb", "8c84f378-92c1-4df0-9602-c747dd6e2fa3", "e06b1c0e-932d-4a7e-baa5-a441d664126c", "SUMMARY"))