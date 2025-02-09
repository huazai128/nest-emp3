#!/bin/bash

# 定义模板目录和目标目录
TEMPLATE_DIR="./templates"
PAGES_DIR="./src/pages"

# 显示所有可用的模板
echo "可用的模板列表："
templates=($(ls $TEMPLATE_DIR))
for i in "${!templates[@]}"; do
    echo "$((i+1))) ${templates[$i]}"
done
 
# 提示用户选择模板
echo ""
echo "请选择模板 (输入数字):"
read template_choice

# 验证选择
if ! [[ $template_choice =~ ^[0-9]+$ ]] || [ $template_choice -lt 1 ] || [ $template_choice -gt ${#templates[@]} ]; then
    echo "无效的选择"
    exit 1
fi

# 获取选中的模板名称
selected_template=${templates[$((template_choice-1))]}

# 提示用户输入新页面名称
echo ""
echo "请输入新页面名称 (例如: share):"
read new_page_name

# 验证新页面名称
if [[ -z "$new_page_name" ]]; then
    echo "页面名称不能为空"
    exit 1
fi

# 转换页面名称为小写并替换空格为连字符
new_page_name=$(echo "$new_page_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

# 检查目标目录是否已存在
if [ -d "$PAGES_DIR/$new_page_name" ]; then
    echo "错误: 页面 '$new_page_name' 已存在"
    exit 1
fi

# 复制模板目录到新页面目录
echo "正在创建新页面..."
cp -r "$TEMPLATE_DIR/$selected_template" "$PAGES_DIR/$new_page_name"

# 替换文件内容中的模板名称
find "$PAGES_DIR/$new_page_name" -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" | while read file; do
    # 将模板名替换为新页面名称（驼峰式）
    camel_case_name=$(echo "$new_page_name" | sed -E 's/-([a-z])/\U\1/g' | sed -E 's/^([a-z])/\U\1/')
    sed -i '' "s/$selected_template/$camel_case_name/g" "$file" 2>/dev/null || sed -i "s/$selected_template/$camel_case_name/g" "$file"
    
    # 如果是index.tsx文件，替换路由路径
    if [[ "$file" == *"/index.tsx" ]]; then
        # 替换根路径 path: '/'
        sed -i '' "s|path: '/'|path: '${new_page_name}/'|g" "$file" 2>/dev/null || sed -i "s|path: '/'|path: '${new_page_name}/'|g" "$file"
        
        # 替换其他路径 path: '/xxx'，保持后面的路径不变
        sed -i '' "s|path: '/\([^']*\)'|path: '${new_page_name}/\1'|g" "$file" 2>/dev/null || sed -i "s|path: '/\([^']*\)'|path: '${new_page_name}/\1'|g" "$file"
    fi
done

echo "✅ 页面创建成功！"
echo "📁 位置: $PAGES_DIR/$new_page_name"
echo "🚀 可以通过运行 'npm run run-entry' 来启动新页面" 