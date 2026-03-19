const vscode = require('vscode');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

let server = null;

function getConfiguration() {
  const config = vscode.workspace.getConfiguration('atomSyncSaver');
  return {
    port: config.get('serverPort', 3000),
    savePath: config.get('savePath', ''),
    autoOpenFiles: config.get('autoOpenFiles', true),
    defaultSavePath: config.get('defaultSavePath', '')
  };
}

function activate(context) {
  console.log('Atom Sync Saver extension is now active');
  // 检测必要的环境:
  console.log("vscode.workspace.workspaceFolders :", vscode.workspace.workspaceFolders);

  const startServerCommand = vscode.commands.registerCommand('atom-sync-saver.startServer', () => {
    startServer();
  });

  const stopServerCommand = vscode.commands.registerCommand('atom-sync-saver.stopServer', () => {
    stopServer();
  });

  const configureCommand = vscode.commands.registerCommand('atom-sync-saver.configure', () => {
    openSettings();
  });

  context.subscriptions.push(startServerCommand, stopServerCommand, configureCommand);

  startServer();
}

function deactivate() {
  stopServer();
}

function openSettings() {
  vscode.commands.executeCommand('workbench.action.openSettings', 'atomSyncSaver');
}

function startServer() {
  if (server) {
    vscode.window.showInformationMessage('Server is already running');
    return;
  }

  const config = getConfiguration();
  const port = config.port;

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.post('/collect', (req, res) => {
    const data = req.body;
    handleData(data);
    res.json({ success: true });
  });

  server = app.listen(port, () => {
    vscode.window.showInformationMessage(`Atom Sync Server started on port ${port}`);
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      vscode.window.showErrorMessage(`Port ${port} is already in use. Please choose a different port in settings.`);
      server = null;
    } else {
      vscode.window.showErrorMessage(`Server error: ${err.message}`);
    }
  });
}

function stopServer() {
  if (server) {
    server.close(() => {
      vscode.window.showInformationMessage('Atom Sync Server stopped');
      console.log('Server stopped');
    });
    server = null;
  }
}

function parseUrl(url) {
  // api / v1 / files / view =>创建文件
  // api / v1 / files   =>获取文件列表,并创建文件(夹)

  // api/v1/files/view?path=%2Fchats%2Faf7dd452231540c08fc078dacdc1326e%2Fworkspace%2Fapp%2Ffrontend%2Fsrc%2FApp.tsx
  // api/v1/files/view?path=chat/{chatId}/{...pathSegments}

  let [uri, $path] = url.split('?');
  const is_dir = uri.endsWith('files');
  // workspace后面才是我们需要映射的真实路径
  $path = decodeURIComponent($path);
  const related_path = $path.split('/workspace/')[1];
  return { is_dir, related_path };
}


function handleData(data) {
  if (!data) return;
  const config = getConfiguration();
  let basePath = config.savePath;

  if (!basePath) {
    // 1. 尝试使用当前活动窗口的工作区
    const activeWindow = vscode.window.activeTextEditor;
    if (activeWindow) {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeWindow.document.uri);
      if (workspaceFolder) {
        basePath = workspaceFolder.uri.fsPath;
      }
    }

    // 2. 尝试使用第一个工作区
    if (!basePath && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
      basePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }

    // 3. 尝试使用配置的默认保存路径
    if (!basePath && config.defaultSavePath) {
      basePath = config.defaultSavePath;
    }

    // 4. 最后使用扩展目录作为备用
    if (!basePath) {
      basePath = __dirname;
    }
  }

  // 确保保存路径存在
  if (!fs.existsSync(basePath)) {
    try {
      fs.mkdirSync(basePath, { recursive: true });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to create save path: ${error.message}`);
      return;
    }
  }

  try {
    const { response, url } = data;
    let { is_dir, related_path } = parseUrl(url);
    console.log("is_dir:", is_dir);
    console.log("related_path:", related_path);
    if (!response) return;
    if (!related_path) return;
    if (!is_dir) {
      const filePath = path.join(basePath, related_path);
      console.log("filePath:", filePath);
      fs.mkdirSync(path.resolve(path.dirname(filePath)), { recursive: true }); // 确保目录存在
      fs.writeFileSync(filePath, response, 'utf-8');
      console.log(`File created: ${filePath}`);

      return;
    }
    return
    let parsedData;
    try {
      parsedData = JSON.parse(response);
    } catch (e) {
      parsedData = response;
    }
    const filePath = path.join(basePath, related_path);

    vscode.window.showInformationMessage(`File created: ${related_path}`);

    if (config.autoOpenFiles) {
      const openDocument = vscode.Uri.file(filePath);
      vscode.workspace.openTextDocument(openDocument).then(doc => {
        vscode.window.showTextDocument(doc);
      });
    }

  } catch (error) {
    vscode.window.showErrorMessage(`Error creating file: ${error.message}`);
  }
}

module.exports = {
  activate,
  deactivate
};