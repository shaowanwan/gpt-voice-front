# GPT 语音聊天前端

这是一个基于 React 的实时聊天应用，支持与 GPT 进行对话并获取语音回复。

## 功能特点

- 实时文本对话
- GPT响应自动语音播放
- 支持重新播放历史语音
- 响应式设计
- 支持快捷键操作

## 技术栈

- React 18+
- Axios
- Next.js

## 安装与运行

1. 安装依赖：

```bash
npm install
# 或
yarn install
```

2. 运行开发服务器：

```bash
npm run dev
# 或
yarn dev
```

应用将在 `http://localhost:3000` 启动。

## 目录结构

```
src/
  ├── app/
  │   └── page.js    # 主页面组件
  ├── components/
  │   └── Chat.js    # 聊天组件
  └── package.json
```

## 环境要求

- Node.js 16+
- npm 7+ 或 yarn 1.22+
- 后端服务器需在 `http://localhost:5001` 运行

## 配置说明

如需修改后端 API 地址，请在 `Chat.js` 中更新：

```javascript
const API_BASE_URL = 'http://localhost:5001';  // 修改为你的后端地址
```

## 使用说明

1. 在输入框中输入消息
2. 按回车键或点击发送按钮发送消息
3. GPT 回复会自动播放语音
4. 点击"播放音频"按钮可重新播放语音

## 键盘快捷键

- `Enter`: 发送消息
- `Shift + Enter`: 输入框换行

## API 接口

### 发送消息

```javascript
POST /gpt
Content-Type: application/json

{
  "prompt": "用户: 你好\nassistant: 您好！"
}
```

响应格式：

```javascript
{
  "response": "GPT的回复文本",
  "audio_path": "语音文件路径.wav"
}
```

### 获取音频

```javascript
GET /audio/{audio_path}
```

## 常见问题

1. **音频无法播放**
    - 检查后端服务是否正常运行
    - 确认浏览器允许音频播放
    - 检查控制台是否有错误信息

2. **消息发送失败**
    - 确认后端服务地址配置正确
    - 检查网络连接
    - 查看浏览器控制台错误信息

## 开发注意事项

1. 所有的 API 请求都应该包含错误处理
2. 音频播放需要考虑兼容性问题
3. 注意处理并发请求和加载状态
4. 保持用户界面的响应性

## 许可证

MIT License