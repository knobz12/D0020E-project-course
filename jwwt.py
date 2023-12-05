import jwt
dic = {"name": 'Jonathan Ekberg',
  "email": 'jodrim@gmail.com',
  "picture": 'https://avatars.githubusercontent.com/u/55556723?v=4',
  "sub": '55556723',
  "iat": 1701691432,
  "exp": 1704283432,
  "jti": '350e97f7-a467-48e3-b028-1656679f14fb'
}
encoded = jwt.encode(dic, "123", algorithm="HS256")
print(encoded)
token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9uYXRoYW4gRWtiZXJnIiwiZW1haWwiOiJqb2RyaW1AZ21haWwuY29tIiwicGljdHVyZSI6Imh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS81NTU1NjcyMz92PTQiLCJzdWIiOiI1NTU1NjcyMyIsImlhdCI6MTcwMTY5MzA1OH0.noIvAqibxazRUF7MdOYwpZLsYBvfEi3NT_1mZzkRWoA"
x = jwt.decode(token, "123", algorithms=["HS256"])
print(x)