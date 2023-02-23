import shutil
import sys
import os


REPLACE = []

match (sys.argv[1] if len(sys.argv) > 1 else "dev"):
    case "dev":
        print("dev")
        if os.path.isdir("source/_posts"):
            shutil.rmtree("source/_posts")
        shutil.copytree("source/pages", "source/_posts")
        for path, dirs, files in os.walk('source/_posts'):
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
        # 将其他页面文件移动到source目录
        for item in os.listdir("config"):
            old_path = os.path.join("config", item)
            new_path = os.path.join("source", item)
            if os.path.isdir(old_path):
                shutil.move(old_path, new_path)
            else:
                shutil.move(old_path, "source.")

    case "prod":
        print("prod")
        # 将Markdown文件移动到正确的位置
        if os.path.isdir("source/_posts"):
            shutil.rmtree("source/_posts")
        shutil.copytree("source/pages", "source/_posts")
        # 将其他页面文件移动到source目录
        for item in os.listdir("config"):
            old_path = os.path.join("config", item)
            new_path = os.path.join("source", item)
            if os.path.isdir(old_path):
                shutil.move(old_path, new_path)
            else:
                shutil.move(old_path, "source.")
        # 预处理Markdown文件
        for path, dirs, files in os.walk('source/_posts'):
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
        for item in os.listdir("setting"):
            path = os.path.join("setting", item)
            if os.path.isdir(path):
                shutil.move(path, item)
            else:
                shutil.move(path, ".")

    case "beta":
        shutil.rmtree("source/_posts")
        os.remove("_config.butterfly.yml")
