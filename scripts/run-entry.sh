#!/bin/bash

# 显示所有可用的入口列表
echo "可用的入口列表："
echo "0) index (主页)"

# 使用 find 命令查找 src/pages 直接子目录下的 index.tsx 文件
entries=($(find ./src/pages -maxdepth 2 -mindepth 2 -name "index.tsx"))
for i in "${!entries[@]}"; do
    # 将完整路径转换为相对路径显示
    entry_path=${entries[$i]}
    entry_path=${entry_path#./src/}
    echo "$((i+1))) ${entry_path%/index.tsx}"
done

# 提示用户选择
echo ""
echo "请选择要运行的入口 (输入数字):"
read choice

# 处理用户选择
if [[ $choice == "0" ]]; then
    ENTRY="" npm run dev
elif [[ $choice =~ ^[0-9]+$ ]] && [ $choice -le ${#entries[@]} ]; then
    selected_entry=${entries[$((choice-1))]}
    selected_entry=${selected_entry#./src/}
    selected_entry=${selected_entry%/index.tsx}
    echo "正在启动 $selected_entry..."
    ENTRY=$selected_entry yarn dev
else
    echo "无效的选择"
    exit 1
fi 