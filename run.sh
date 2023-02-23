datetime=`date +%F\ %T`
echo "执行脚本 ${datetime}"

# 代码提交GitHub
text="提交 ${datetime} $1"
git rm -r --cached .
git add .
git commit -m "${text}"
echo "本地Git 提交完成"
git push main main -f
echo "GitHub 提交完成"