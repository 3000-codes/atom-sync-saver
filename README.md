# Atom Sync Saver

一个 VSCode 插件和油猴脚本的组合，用于从 atoms.dev 捕获 API 响应并自动创建项目文件结构。

## 功能特性

### 🚀 主要功能
- **自动数据捕获**：油猴脚本自动捕获 atoms.dev 的 API 响应
- **本地服务器**：VSCode 插件启动本地服务器接收数据
- **智能文件创建**：根据接收到的数据自动创建文件和目录结构
- **灵活配置**：支持自定义保存路径、端口等选项
- **多工作区支持**：智能选择当前活动工作区作为保存位置

### 🛠 技术特点
- **跨平台**：支持 macOS、Windows 和 Linux
- **低资源消耗**：轻量级服务器，占用资源少
- **容错处理**：优雅处理各种边界情况
- **实时反馈**：操作过程中提供清晰的状态提示

## 安装步骤

### 1. 安装 VSCode 插件

#### 方法 A：从 VSIX 文件安装
1. 下载 `atom-sync-saver-0.0.1.vsix` 文件
2. 在 VSCode 中按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
3. 输入 `Extensions: Install from VSIX...`
4. 选择下载的 VSIX 文件

#### 方法 B：从源代码安装
1. 克隆项目到本地
2. 打开项目目录
3. 运行 `pnpm install` 安装依赖
4. 按 `F5` 启动扩展开发主机进行测试

### 2. 安装油猴脚本

1. 打开 `atom.js` 文件
2. 复制完整代码
3. 在浏览器中打开油猴插件管理页面
4. 点击 "添加新脚本"
5. 粘贴代码并保存
6. 确保脚本已启用

## 使用方法

### 1. 启动服务器
- 在 VSCode 中按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
- 输入 `Start Sync Server` 并执行
- 服务器会在配置的端口（默认 3000）上启动

### 2. 捕获数据
- 打开浏览器并访问 `https://atoms.dev/chat/*`
- 油猴脚本会自动捕获 API 响应
- 数据会发送到本地服务器

### 3. 查看结果
- 文件会自动创建在配置的保存路径
- 如果启用了 `autoOpenFiles`，文件会自动在 VSCode 中打开
- 目录结构会根据 API 响应自动生成

### 4. 停止服务器
- 在 VSCode 中按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
- 输入 `Stop Sync Server` 并执行

## 配置选项

在 VSCode 设置中搜索 `atomSyncSaver` 可以配置以下选项：

| 配置项 | 默认值 | 描述 |
|--------|--------|------|
| `serverPort` | 3000 | 服务器端口号 |
| `savePath` | "" | 自定义保存路径（空 = 使用工作区根目录） |
| `autoOpenFiles` | true | 自动在编辑器中打开创建的文件 |
| `defaultSavePath` | "" | 无工作区时的默认保存路径（空 = 使用扩展目录） |

## 项目结构

```
atom-sync-saver/
├── atom.js              # 油猴脚本
├── extension.js         # VSCode 插件主文件
├── package.json         # 插件配置
├── atom-sync-saver-0.0.1.vsix  # 打包后的插件
└── app/                 # 生成的前端项目示例
    └── frontend/        # 前端项目结构
```

## 工作原理

1. **数据捕获**：油猴脚本拦截 atoms.dev 的 XHR 请求和响应
2. **数据发送**：将捕获的数据通过 POST 请求发送到本地服务器
3. **数据处理**：VSCode 插件接收数据并解析路径信息
4. **文件创建**：根据解析的路径创建文件和目录结构
5. **用户反馈**：提供操作状态的实时反馈

## 常见问题

### Q: 服务器启动失败怎么办？
A: 检查端口是否被占用，在设置中修改 `serverPort` 为其他端口。

### Q: 文件没有创建怎么办？
A: 检查保存路径是否存在，确保有写入权限。

### Q: 工作区为空时文件保存在哪里？
A: 会使用配置的 `defaultSavePath`，如果未配置则使用扩展目录。

### Q: 如何查看日志？
A: 在 VSCode 中打开开发者工具（`Cmd+Option+I` 或 `Ctrl+Shift+I`）查看控制台输出。

## 开发指南

### 打包插件
```bash
# 安装依赖
pnpm install

# 打包插件
npx vsce package --no-dependencies
```

### 测试插件
1. 按 `F5` 启动扩展开发主机
2. 在开发主机中测试插件功能
3. 查看控制台输出进行调试

## 许可证

ISC License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受自动同步和文件创建的便利！** 🎉