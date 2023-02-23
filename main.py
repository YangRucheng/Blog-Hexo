import shutil
import sys
import os


REPLACE = [
    ("6811396yang", 'Your Password'),
    ("123456yang", 'Your Password'),
]

match (sys.argv[1] if len(sys.argv) > 1 else "dev"):
    case "dev":
        print("dev")
        if os.path.isdir("source/_posts"):
            shutil.rmtree("source/_posts")
        shutil.copytree("content", "source/_posts")
        for path, dirs, files in os.walk('source'):
            for file in files:
                filepath = os.path.join(path, file)
                if filepath.endswith('md'):
                    with open(filepath, 'r', encoding='utf-8') as fr:
                        text = fr.read()
                    for value in REPLACE:
                        text = text.replace(value[0], value[1])
                    with open(filepath, 'w', encoding='utf-8')as fw:
                        fw.write(text)
        shutil.copy("config.yml", "_config.butterfly.yml")

    case "prod":
        print("prod")
        # 将Markdown文件移动到正确的位置
        if os.path.isdir("source/_posts"):
            shutil.rmtree("source/_posts")
        shutil.copytree("content", "source/_posts")
        # 去除文件中的敏感词或密码
        for path, dirs, files in os.walk('source'):
            for file in files:
                filepath = os.path.join(path, file)
                if filepath.endswith('md'):
                    with open(filepath, 'r', encoding='utf-8') as fr:
                        text = fr.read()
                    for value in REPLACE:
                        text = text.replace(value[0], value[1])
                    with open(filepath, 'w', encoding='utf-8')as fw:
                        fw.write(text)
        # 将配置文件移动到正确的位置
        shutil.copy("config.yml", "_config.butterfly.yml")
        for item in os.listdir("config"):
            path = os.path.join("config", item)
            if os.path.isdir(path):
                shutil.move(path, item)
            else:
                shutil.move(path, ".")
