# vue-sfc

本專案為 Vue 3 + Vite 的範例，使用 SFC 與元件化設計。主要結構：

- `index.html`：乾淨入口（只載入 `/src/main.js`）。
- `src/main.js`：只負責建立與掛載 Vue 應用。
- `src/App.vue`：主 SFC，引用 `src/components/*` 中的元件。

部署到 GitHub 的步驟：

1. 在本機建立 git 並加入遠端（以你的 repo 為例）：

```bash
git init
git add .
git commit -m "Initial Vue SFC project"
git branch -M main
git remote add origin https://github.com/gogochi/vue-sfc.git
git push -u origin main
```

2. 在 GitHub Repo 頁面 -> Settings -> Pages，將 Build and deployment 的 Source 設為 **GitHub Actions**（或依照提示啟用 Pages）。

3. GitHub Actions 會自動執行 `.github/workflows/deploy.yml`，在 `main` 分支 push 後會執行 `npm ci`、`npm run build`，並部署 `dist/` 到 GitHub Pages。網站將會出現在：

```
https://gogochi.github.io/vue-sfc/
```

注意事項：若你的 repo 為私人或需要自訂 domain，可在 Pages 設定中修改。
