import os

replaceList = [
    ("6811396yang", 'Your Password'),
    ("123456yang", 'Your Password'),
]

for path, dirs, files in os.walk('./source'):
    for file in files:
        filepath = os.path.join(path, file)
        if filepath.endswith('md'):
            with open(filepath, 'r', encoding='utf-8') as fr:
                text = fr.read()
            for value in replaceList:
                text = text.replace(value[0], value[1])
            with open(filepath, 'w', encoding='utf-8')as fw:
                fw.write(text)
