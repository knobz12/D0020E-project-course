from jose import jwe
x = jwe.encrypt('Jag har bara en 3700x :( sadface.)', 'This is the: 123', algorithm='dir', encryption='A128GCM')

print(x)
#jwe.decrypt('eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4R0NNIn0..McILMB3dYsNJSuhcDzQshA.OfX9H_mcUpHDeRM4IA.CcnTWqaqxNsjT4eCaUABSg', 'asecret128bitkey')
#'Hello, World!'